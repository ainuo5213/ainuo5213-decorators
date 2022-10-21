import { ClassStruct } from '../types'
import { AbstractContainer, ServiceValue, Lifecycle } from './types'

export class Container extends AbstractContainer {
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
    // TODO: 这里需要区分生命周期，需要在特定的请求、程序开始时分别生成类的实例
    if (lifecycle === Lifecycle.singleton) {
      return this.resolveSingleton(serviceValue)
    }

    return this.resolveSingleton(serviceValue)
  }
  private resolveSingleton<T>(serviceValue: ServiceValue): T {
    const ctor = serviceValue.constructor as any
    const instance = ctor.instance
    if (instance) {
      return instance as T
    }

    const params: ClassStruct[] = []
    serviceValue.dependencies.forEach((dep) => {
      const depInstance = this.resolveSingleton<ClassStruct>(dep)
      params.push(depInstance)
    })

    ctor.instance = Reflect.construct(ctor, params)

    return ctor.instance as T
  }
}
