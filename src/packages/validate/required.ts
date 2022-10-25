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

function Required(
  message: string = ''
): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(RequiredValidationFilter, [message])
  return defineValidationMetadata(
    validation,
    validateMetadataNameValue,
    (type) => type === String
  )
}

export const PropRequired = Required as (message?: string) => PropertyDecorator
export const ParamRequired = Required as (
  message?: string
) => ParameterDecorator
