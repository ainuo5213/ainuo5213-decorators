/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 08:19:48
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 15:50:23
 * @FilePath: \ainuo5213-decorators\src\core\validate\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
export abstract class AbstractValidationFilter {
  constructor(errorMessage: string = '') {
    this.errorMessage = errorMessage
  }
  public readonly errorMessage: string = ''
  abstract validate(data: any): boolean
}

export const validateMetadataKey = 'parameter-validation'
export const validateMetadataName = 'parameter-validation-name'

export type ValidateResult = {
  valid: boolean
  errorMessage: string
}

export function defineValidationMetadata(
  validation: AbstractValidationFilter,
  validateMetadataNameValue: string,
  typeCheckPredict?: (type: Function) => boolean
): PropertyDecorator {
  return (target, propKey) => {
    if (
      typeof typeCheckPredict === 'function' &&
      !typeCheckPredict(Reflect.getMetadata('design:type', target, propKey))
    ) {
      throw new TypeError(
        `type is not compatible for key '${propKey as string}'`
      )
    }

    let validationNames = Reflect.getMetadata(
      validateMetadataName,
      target,
      propKey
    ) as string[] | undefined
    if (validationNames === undefined) {
      validationNames = []
    }
    if (!validationNames.includes(validateMetadataNameValue)) {
      validationNames.unshift(validateMetadataNameValue)
    }
    Reflect.defineMetadata(
      validateMetadataName,
      validationNames,
      target,
      propKey
    )

    Reflect.defineMetadata(
      validateMetadataKey,
      validation,
      target,
      `${propKey as string}.${validateMetadataNameValue}`
    )
  }
}
