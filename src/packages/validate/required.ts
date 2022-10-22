import {
  AbstractValidationFilter,
  validateMetadataKey
} from './../../core/validate'
import 'reflect-metadata'

export class RequiredValidationFilter extends AbstractValidationFilter {
  validate(data: any): boolean {
    throw new Error('Method not implemented.')
  }
}

export const Required = (message: string = ''): PropertyDecorator => {
  return (target, propKey) => {
    if (message.length === 0) {
      message = `${propKey as string} is required`
    }
    const validation = new RequiredValidationFilter(message)
    Reflect.defineMetadata(validateMetadataKey, validation, propKey)
  }
}
