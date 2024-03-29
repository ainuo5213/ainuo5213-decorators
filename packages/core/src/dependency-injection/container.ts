import { ServiceKey } from './types'
import { ClassStruct } from '../types'
import { AbstractContainer, ServiceValue, Lifecycle } from './types'

export class Container extends AbstractContainer {
  protected services: Map<ServiceKey, ServiceValue> = new Map()
  constructor(services: Map<ServiceKey, ServiceValue>) {
    super()
    this.services = services
  }
  private concurrentServices: Map<ServiceKey, ServiceValue> = new Map()
  dispose(): void {
    // 释放操作，transiant每次都是新的，所以不用释放，singleton全程只有一个也不用释放，所以仅需要释放scoped
    this.concurrentServices.forEach((r) => {
      const ctor = r.constructor as any
      delete ctor.instance
    })
  }
  resolve<T>(key: string): T
  resolve<T>(constuctor: ClassStruct): T
  resolve<T>(constuctor: unknown): T {
    let serviceValue: ServiceValue | undefined = this.services.get(
      constuctor as ClassStruct | string
    )
    if (!serviceValue) {
      throw new Error('service is not register')
    }

    const lifecycle = serviceValue.option.lifecycle

    switch (lifecycle) {
      case Lifecycle.singleton:
        return this.resolveSingleton(serviceValue)
      case Lifecycle.scoped:
        const instance = this.resolveScope(serviceValue)
        return instance as T
      case Lifecycle.transiant:
        return this.resolveTransiant(serviceValue)
      default:
        return this.resolveSingleton(serviceValue)
    }
  }

  private resolveTransiant<T>(serviceValue: ServiceValue): T {
    // transiant：每次resolve都是一个新的对象
    return this.resolveScope(serviceValue)
  }

  private resolveScope<T>(serviceValue: ServiceValue): T {
    // scope：单个请求整个过程是一个实例，多个请求是多个，同单例但请求完之后需要释放
    if (!this.concurrentServices.has(serviceValue.constructor)) {
      this.concurrentServices.set(serviceValue.constructor, serviceValue)
    }
    return this.resolveSingleton(serviceValue)
  }

  private resolveSingleton<T>(serviceValue: ServiceValue): T {
    // 多个请求访问同一个实例
    const ctor = serviceValue.constructor as any
    const instance = ctor.instance
    if (instance) {
      return instance as T
    }

    ctor.instance = this.resolveInstance(serviceValue)

    return ctor.instance as T
  }

  private resolveInstance<T>(serviceValue: ServiceValue): T {
    if (serviceValue.resolveType === 'constructor') {
      return this.resolveConstructorInstance(serviceValue)
    } else if (serviceValue.resolveType === 'property') {
      return this.resolvePropertyInstance(serviceValue)
    } else {
      return this.resolveCombinationInstance(serviceValue)
    }
  }

  private resolveCombinationInstance<T>(serviceValue: ServiceValue): T {
    const properties: Array<{ propKey: string; instance: ClassStruct }> = []
    const ctors: ClassStruct[] = []
    serviceValue.dependencies.forEach((dep) => {
      const depInstance = this.resolveInstance<ClassStruct>(dep)
      if (dep.resolveType === 'constructor') {
        ctors.push(depInstance)
      } else if (dep.resolveType === 'property') {
        properties.push({
          propKey: dep.propKey!,
          instance: depInstance
        })
      }
    })

    const instance = Reflect.construct(serviceValue.constructor, ctors) as T
    properties.forEach((r) => {
      ;(instance as any)[r.propKey!] = r.instance
    })

    return instance
  }

  private resolvePropertyInstance<T>(serviceValue: ServiceValue): T {
    const instance = Reflect.construct(serviceValue.constructor, []) as T
    serviceValue.dependencies.forEach((dep) => {
      const depInstance = this.resolveInstance<ClassStruct>(dep)
      ;(instance as any)[dep.propKey!] = depInstance
    })

    return instance
  }

  private resolveConstructorInstance<T>(serviceValue: ServiceValue): T {
    const params: ClassStruct[] = []
    serviceValue.dependencies.forEach((dep) => {
      const depInstance = this.resolveInstance<ClassStruct>(dep)
      params.push(depInstance)
    })

    const instance = Reflect.construct(serviceValue.constructor, params) as T

    return instance
  }
}
