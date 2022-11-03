import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from '@ainuo5213/core'

export class MaxCountValidationFilter extends AbstractValidationFilter {
  public readonly maxCount: number = 0
  constructor(maxCount: number = 0, errorMessage: string = '') {
    super(errorMessage)
    this.maxCount = maxCount
  }
  validate(data: Array<unknown>): boolean {
    return data.length <= this.maxCount
  }
}

const validateMetadataNameValue = 'MaxCount'
function MaxCount(
  minCount: number = 0,
  message: string = ''
): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(MaxCountValidationFilter, [
    minCount,
    message
  ])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === Array
  )
}

export const PropMaxCount = MaxCount as (
  maxCount: number,
  message?: string
) => PropertyDecorator
export const ParamMaxCount = MaxCount as (
  maxCount: number,
  message?: string
) => ParameterDecorator
