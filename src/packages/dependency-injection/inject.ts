import 'reflect-metadata'
import { BaseController } from '../../core/controller'

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
export const Inject = (
  option: InjectOption = {
    lifecycle: Lifecycle.transiant,
    injectType: InjectType.constructor
  }
): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof BaseController)) {
      throw new TypeError(
        target.name + ' not instance of ' + BaseController.name
      )
    }

    const metadataValue = {
      option,
      constructor: target
    }
    Reflect.defineMetadata('di', metadataValue, target)
  }
}
