/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:32:32
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 08:27:28
 * @FilePath: \ainuo5213-decorators\src\core\route\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import { MethodMetadataKey, PathMetadataKey } from '../types'

export const generateRouteDecorator = (method: string) => {
  return (path: string): MethodDecorator => {
    return (_, _key, descriptor) => {
      Reflect.defineMetadata(MethodMetadataKey, method, descriptor.value!)
      Reflect.defineMetadata(PathMetadataKey, path, descriptor.value!)
    }
  }
}
