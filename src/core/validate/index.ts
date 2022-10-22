/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 08:19:48
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 08:32:26
 * @FilePath: \ainuo5213-decorators\src\core\validate\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
export abstract class AbstractValidationFilter {
  constructor(errorMessage: string = '') {
    this.errorMessage = errorMessage
  }
  protected errorMessage: string = ''
  abstract validate(data: any): boolean
}

export const validateMetadataKey = 'parameter-validation'
