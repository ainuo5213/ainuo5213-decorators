/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 15:32:12
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 15:50:48
 * @FilePath: \ainuo5213-decorators\src\packages\validate\regular.ts
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

export const Regular = (
  regExp: RegExp,
  message: string = ''
): PropertyDecorator | ParameterDecorator => {
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
