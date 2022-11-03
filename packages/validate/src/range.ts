import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from '@ainuo5213/core'
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

function Range(
  minLength: number,
  maxLength: number,
  message: string = ''
): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(RangeValidationFi1lter, [
    minLength,
    maxLength,
    message
  ])
  return defineValidationMetadata(validation, validateMetadataNameValue)
}

export const PropRange = Range as (
  minLength: number,
  maxLength: number,
  message?: string
) => PropertyDecorator
export const ParamRange = Range as (
  minLength: number,
  maxLength: number,
  message?: string
) => ParameterDecorator
