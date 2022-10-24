import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from './../../core/validate'
import { isNullable } from './is'

export class RangeValidationFi1lter extends AbstractValidationFilter {
  public readonly minLength: number
  public readonly maxLength: number
  constructor(minLength: number, maxLength: number, errorMessage: string = '') {
    super(errorMessage)
    this.minLength = minLength
    this.maxLength = maxLength
  }
  validate(data: string): boolean {
    data = isNullable(data) ? '' : data
    const length = data.length
    return length >= this.minLength && length <= this.maxLength
  }
}

const validateMetadataNameValue = 'Range'

export const Range = (
  minLength: number,
  maxLength: number,
  message: string = ''
): PropertyDecorator | ParameterDecorator => {
  const validation = Reflect.construct(RangeValidationFi1lter, [
    minLength,
    maxLength,
    message
  ])
  return defineValidationMetadata(validation, validateMetadataNameValue)
}
