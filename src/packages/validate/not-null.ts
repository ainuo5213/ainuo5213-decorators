/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 15:36:36
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 15:37:02
 * @FilePath: \ainuo5213-decorators\src\packages\validate\not-null.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from './../../core/validate'
import { isNullable } from './is'

export class NotNullValidationFilter extends AbstractValidationFilter {
  validate(data: unknown): boolean {
    return !isNullable(data)
  }
}

const validateMetadataNameValue = 'NotNull'

export const NotNull = (
  message: string = ''
): PropertyDecorator | ParameterDecorator => {
  const validation = Reflect.construct(NotNullValidationFilter, [message])
  return defineValidationMetadata(validation, validateMetadataNameValue)
}
