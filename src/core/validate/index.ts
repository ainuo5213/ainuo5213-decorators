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
export const validateMetadataProperty = 'parameter-validation-property'
export type ValidateMetadataProperty = {
  propertyName: string
  propertyType: unknown
}

export type ValidateResult = {
  valid: boolean
  errorMessage: string
}

export function defineValidationMetadata(
  validation: AbstractValidationFilter,
  validateMetadataNameValue: string,
  typeCheckPredict?: (type: Function) => boolean
): ParameterDecorator | PropertyDecorator {
  return (target: Object, propKey: string | symbol, paramIndex?: number) => {
    const type =
      paramIndex !== undefined
        ? Reflect.getMetadata('design:paramtypes', target, propKey)[0]
        : Reflect.getMetadata('design:type', target, propKey)
    if (typeof typeCheckPredict === 'function' && !typeCheckPredict(type)) {
      throw new TypeError(
        `type is not compatible for key '${propKey as string}'`
      )
    }
    let validateNamePropertyKey =
      paramIndex !== undefined ? `${propKey as string}.${paramIndex}` : propKey

    let validateKeyPropertyKey =
      paramIndex !== undefined
        ? `${propKey as string}.${paramIndex}.${validateMetadataNameValue}`
        : `${propKey as string}.${validateMetadataNameValue}`

    let validationNames = Reflect.getMetadata(
      validateMetadataName,
      target,
      validateNamePropertyKey
    ) as string[] | undefined
    if (validationNames === undefined) {
      validationNames = []
    }
    if (!validationNames.includes(validateMetadataNameValue)) {
      validationNames.unshift(validateMetadataNameValue)
    }
    // 定义对象的字段。
    // TODO: 由于typescript的限制一个属性需要赋值初始值才能够找到这个属性
    // 所以我们需要一个公用的标识该属性的装饰器，这个装饰器用于标识对象的属性，这样实例化的时候就可以给对象的属性赋值
    // 这样也可以做到属性注入
    // if (paramIndex !== undefined) {
    //   let propertyFieldMetadata =
    //     (Reflect.getMetadata(
    //       validateMetadataProperty,
    //       target
    //     ) as ValidateMetadataProperty[]) || []
    //   propertyFieldMetadata.push({
    //     propertyName: propKey as string,
    //     propertyType: type
    //   })

    //   Reflect.defineMetadata(
    //     validateMetadataProperty,
    //     propertyFieldMetadata,
    //     target
    //   )
    // }

    Reflect.defineMetadata(
      validateMetadataName,
      validationNames,
      target,
      validateNamePropertyKey
    )

    Reflect.defineMetadata(
      validateMetadataKey,
      validation,
      target,
      validateKeyPropertyKey
    )
  }
}
