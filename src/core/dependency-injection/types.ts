import { ClassStruct, IDisposed } from '../types'

export abstract class AbstractContainer implements IDisposed {
  abstract dispose(): void
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

// 生命周期往往只看第一个，因为第一个的生命周期如果是单例那么后续将不再实例化，如果第一个scope则每次请求都会是新的
export enum Lifecycle {
  transiant = 'transient',
  scoped = 'scoped',
  singleton = 'singleton'
}

export type InjectOption = {
  lifecycle?: Lifecycle
}

export type ServiceKey<T = any> = string | ClassStruct<T> | Function
export type ResolveType = 'constructor' | 'property'
export type ServiceValue<T = any> = {
  option: InjectOption
  constructor: Function
  resolveType: ResolveType
  propKey?: string
  dependencies: Map<string, ServiceValue<T>>
}

export abstract class AbstractServiceProviderFactory {
  public static readonly __flag = 'dependency-injection'
  abstract getBuilder(): AbstractContainerBuilder
}
