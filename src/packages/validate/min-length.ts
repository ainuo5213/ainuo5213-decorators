import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from './../../core/validate'
import { isNullable } from './is'

export class MinLengthValidationFilter extends AbstractValidationFilter {
  public readonly minLength: number = 0
  constructor(minLength: number = 0, errorMessage: string = '') {
    super(errorMessage)
    this.minLength = minLength
  }
  validate(data: string): boolean {
    data = isNullable(data) ? '' : data
    if (data === '' || data.length < this.minLength) {
      return false
    }

    return true
  }
}

const validateMetadataNameValue = 'MinLength'
export const MinLength = (
  minLength: number = 0,
  message: string = ''
): PropertyDecorator => {
  const validation = Reflect.construct(MinLengthValidationFilter, [
    minLength,
    message
  ])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === String
  )
}
