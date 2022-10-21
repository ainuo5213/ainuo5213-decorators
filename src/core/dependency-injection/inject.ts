import 'reflect-metadata'
import { InjectOption, InjectType, Lifecycle } from './types'
export const Inject = (
  option: InjectOption = {
    lifecycle: Lifecycle.transiant,
    injectType: InjectType.constructor
  }
): ClassDecorator => {
  return (target) => {
    const metadataValue = {
      option,
      constructor: target
    }

    Reflect.defineMetadata('dependency-injection', metadataValue, target)
  }
}
