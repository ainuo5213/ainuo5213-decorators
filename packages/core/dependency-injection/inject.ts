import 'reflect-metadata'
import {
  AbstractServiceProviderFactory,
  InjectOption,
  Lifecycle
} from './types'
export const Inject = (
  option: InjectOption = {
    lifecycle: Lifecycle.transiant
  }
): ClassDecorator => {
  return (target) => {
    const metadataValue = {
      option,
      constructor: target
    }

    Reflect.defineMetadata(
      AbstractServiceProviderFactory.__flag,
      metadataValue,
      target
    )
  }
}
