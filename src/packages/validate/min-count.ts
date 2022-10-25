import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from './../../core/validate'

export class MinCountValidationFilter extends AbstractValidationFilter {
  public readonly minCount: number = 0
  constructor(minCount: number = 0, errorMessage: string = '') {
    super(errorMessage)
    this.minCount = minCount
  }
  validate(data: Array<unknown>): boolean {
    return data.length >= this.minCount
  }
}

const validateMetadataNameValue = 'MinCount'
function MinCount(
  minCount: number = 0,
  message: string = ''
): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(MinCountValidationFilter, [
    minCount,
    message
  ])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === Array
  )
}

export const PropMinCount = MinCount as (
  minCount: number,
  message?: string
) => PropertyDecorator
export const ParamMinCount = MinCount as (
  minCount: number,
  message?: string
) => ParameterDecorator
