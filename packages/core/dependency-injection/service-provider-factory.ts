import {
  AbstractContainerBuilder,
  AbstractServiceProviderFactory
} from './types'
import { ContainerBuilder } from './container-builder'

export class ServiceProviderFactory extends AbstractServiceProviderFactory {
  private containerBuilder: AbstractContainerBuilder
  getBuilder(): AbstractContainerBuilder {
    if (this.containerBuilder) {
      return this.containerBuilder
    }
    this.containerBuilder = new ContainerBuilder()
    return this.containerBuilder
  }
}
