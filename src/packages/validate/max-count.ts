/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 15:44:24
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 15:51:21
 * @FilePath: \ainuo5213-decorators\src\packages\validate\max-count.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import {
  AbstractValidationFilter,
  defineValidationMetadata
} from '../../core/validate'

export class MaxCountValidationFilter extends AbstractValidationFilter {
  public readonly minCount: number = 0
  constructor(minCount: number = 0, errorMessage: string = '') {
    super(errorMessage)
    this.minCount = minCount
  }
  validate(data: Array<unknown>): boolean {
    return data.length <= this.minCount
  }
}

const validateMetadataNameValue = 'MaxCount'
export const MaxCount = (
  minCount: number = 0,
  message: string = ''
): PropertyDecorator => {
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
