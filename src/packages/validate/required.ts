import {
  AbstractValidationFilter,
  validateMetadataKey
} from './../../core/validate'
import 'reflect-metadata'

export class RequiredValidationFilter extends AbstractValidationFilter {
  validate(data: string): boolean {
    if (data === null || data === undefined || data === '') {
      return false
    }

    return true
  }
}

export const Required = (message: string = ''): PropertyDecorator => {
  return (target, propKey) => {
    if (message.length === 0) {
      message = `${propKey as string} is required`
    }
    const validation = new RequiredValidationFilter(message)
    Reflect.defineMetadata(validateMetadataKey, validation, target, propKey)
  }
}
