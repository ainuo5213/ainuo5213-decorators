import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from '@ainuo5213/core'
import { isNullable } from './is'

export class RegularValidationFilter extends AbstractValidationFilter {
  public readonly regExp: RegExp
  constructor(regExp: RegExp, errorMessage: string = '') {
    super(errorMessage)
    this.regExp = regExp
  }
  validate(data: string): boolean {
    data = isNullable(data) ? '' : data
    if (!this.regExp.test(data)) {
      return false
    }

    return true
  }
}

const validateMetadataNameValue = 'Regular'

function Regular(
  regExp: RegExp,
  message: string = ''
): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(RegularValidationFilter, [
    regExp,
    message
  ])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === String
  )
}

export const PropRegular = Regular as (
  regExp: RegExp,
  message?: string
) => PropertyDecorator
export const ParamRegular = Regular as (
  regExp: RegExp,
  message?: string
) => ParameterDecorator
