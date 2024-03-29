import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from '@ainuo5213/core'
import { isNullable } from './is'

export class MaxLengthValidationFilter extends AbstractValidationFilter {
  public readonly maxLength: number = 0
  constructor(maxLength: number = 0, errorMessage: string = '') {
    super(errorMessage)
    this.maxLength = maxLength
  }
  validate(data: string): boolean {
    data = isNullable(data) ? '' : data
    if (data === '' || data.length > this.maxLength) {
      return false
    }

    return true
  }
}

const validateMetadataNameValue = 'MaxLength'
function MaxLength(
  maxLength: number = 0,
  message: string = ''
): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(MaxLengthValidationFilter, [
    maxLength,
    message
  ])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === String
  )
}

export const PropMaxLength = MaxLength as (
  maxLength: number,
  message?: string
) => PropertyDecorator
export const ParamMaxLength = MaxLength as (
  maxLength: number,
  message?: string
) => ParameterDecorator
