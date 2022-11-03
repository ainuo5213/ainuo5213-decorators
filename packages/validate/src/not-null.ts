import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from '@ainuo5213/core'
import { isNullable } from './is'

export class NotNullValidationFilter extends AbstractValidationFilter {
  validate(data: unknown): boolean {
    return !isNullable(data)
  }
}

const validateMetadataNameValue = 'NotNull'

function NotNull(message: string = ''): PropertyDecorator | ParameterDecorator {
  const validation = Reflect.construct(NotNullValidationFilter, [message])
  return defineValidationMetadata(validation, validateMetadataNameValue)
}

export const PropNotNull = NotNull as (message?: string) => PropertyDecorator
export const ParamNotNull = NotNull as (message?: string) => ParameterDecorator
