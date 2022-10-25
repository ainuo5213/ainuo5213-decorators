/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 07:19:13
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-25 22:04:09
 * @FilePath: \ainuo5213-decorators\src\core\dependency-injection\inject.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import {
  AbstractServiceProviderFactory,
  InjectOption,
  Lifecycle
} from './types'
export const Inject = (
  option: InjectOption = {
    lifecycle: Lifecycle.transiant
  }
): ClassDecorator => {
  return (target) => {
    const metadataValue = {
      option,
      constructor: target
    }

    Reflect.defineMetadata(
      AbstractServiceProviderFactory.__flag,
      metadataValue,
      target
    )
  }
}
