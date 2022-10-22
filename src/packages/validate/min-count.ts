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
export const MinCount = (
  minCount: number = 0,
  message: string = ''
): PropertyDecorator => {
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
