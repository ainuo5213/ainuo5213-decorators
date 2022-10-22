import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from './../../core/validate'
import { isNullable } from './is'

export class RequiredValidationFilter extends AbstractValidationFilter {
  validate(data: string): boolean {
    data = isNullable(data) ? '' : data
    return data !== ''
  }
}

const validateMetadataNameValue = 'Required'

export const Required = (message: string = ''): PropertyDecorator => {
  const validation = Reflect.construct(RequiredValidationFilter, [message])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === String
  )
}
