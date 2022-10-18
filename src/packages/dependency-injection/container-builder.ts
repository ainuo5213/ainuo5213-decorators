import { ClassStruct } from '../../core/types'
import { AbstractContainer, Container } from './container'
import { InjectOption } from './inject'
export interface IContainerBuilder {
  register(key: string, serviceValue: ServiceValue): IContainerBuilder
  register(serviceValue: ServiceValue): IContainerBuilder
  build(): Container
}

export type ServiceKey<T = any> = string | ClassStruct<T> | Function
export type ServiceValue<T = any> = {
  option: InjectOption
  constructor: ClassStruct<T>
}

export class ContainerBuilder implements IContainerBuilder {
  build(): AbstractContainer {
    return new Container(this.services)
  }
  private services: Map<ServiceKey, ServiceValue> = new Map()
  register(key: string, serviceValue: ServiceValue<any>): IContainerBuilder
  register(serviceValue: ServiceValue<any>): IContainerBuilder
  register(key: unknown, serviceValue?: unknown): IContainerBuilder {
    if (typeof key === 'string') {
      if (!this.services.has(key)) {
        this.services.set(key, serviceValue as ServiceValue)
      }
    } else {
      const value = key as ServiceValue
      if (!this.services.has(value.constructor)) {
        this.services.set(value.constructor, value)
      }
    }
    return this
  }
}
