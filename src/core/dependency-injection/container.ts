import { ServiceKey } from './types'
/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 07:19:13
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 07:41:22
 * @FilePath: \ainuo5213-decorators\src\core\dependency-injection\container.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
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
        return this.resolveScope(serviceValue)
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
    const params: ClassStruct[] = []
    serviceValue.dependencies.forEach((dep) => {
      const depInstance = this.resolveInstance<ClassStruct>(dep)
      params.push(depInstance)
    })
    return Reflect.construct(serviceValue.constructor, params) as T
  }
}
