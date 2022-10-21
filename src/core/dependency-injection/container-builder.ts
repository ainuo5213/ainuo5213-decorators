import {
  AbstractContainer,
  AbstractContainerBuilder,
  InjectOption,
  ServiceKey,
  ServiceValue
} from './types'
import { Container } from './container'

export class ContainerBuilder extends AbstractContainerBuilder {
  build(): AbstractContainer {
    return new Container(this.services)
  }
  private services: Map<ServiceKey, ServiceValue> = new Map()
  register(key: string, serviceValue: ServiceValue): AbstractContainerBuilder
  register(serviceValue: ServiceValue): AbstractContainerBuilder
  register(key: unknown, serviceValue?: unknown): AbstractContainerBuilder {
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
