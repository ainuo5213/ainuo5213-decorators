import { ClassStruct } from '../types'

export abstract class AbstractContainer {
  protected services: Map<ServiceKey, ServiceValue> = new Map()
  constructor(services: Map<ServiceKey, ServiceValue>) {
    this.services = services
  }
  abstract resolve<T>(key: string): T
  abstract resolve<T>(constuctor: ClassStruct): T
}

export abstract class AbstractContainerBuilder {
  abstract register(
    key: string,
    serviceValue: ServiceValue
  ): AbstractContainerBuilder
  abstract register(serviceValue: ServiceValue): AbstractContainerBuilder
  abstract build(): AbstractContainer
}

export enum Lifecycle {
  transiant = 'transient',
  scoped = 'scoped',
  singleton = 'singleton'
}

export enum InjectType {
  property = 'property',
  constructor = 'constructor',
  method = 'method'
}

export type InjectOption = {
  lifecycle?: Lifecycle
  injectType?: InjectType
}

export type ServiceKey<T = any> = string | ClassStruct<T> | Function
export type ServiceValue<T = any> = {
  option: InjectOption
  constructor: Function
  dependencies: Map<string, ServiceValue<T>>
}

export abstract class AbstractServiceProviderFactory {
  public readonly __flag = 'dependency-injection'
  abstract getBuilder(): AbstractContainerBuilder
}
