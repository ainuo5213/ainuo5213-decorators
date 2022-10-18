import { ClassStruct } from '../../core/types'
import { ServiceKey, ServiceValue } from './container-builder'

export abstract class AbstractContainer {
  protected services: Map<ServiceKey, ServiceValue> = new Map()
  constructor(services: Map<ServiceKey, ServiceValue>) {
    this.services = services
  }
  abstract resolve<T>(key: string): T
  abstract resolve<T>(constuctor: ClassStruct): T
}

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
  }
}
