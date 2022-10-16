/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:32:32
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 18:29:39
 * @FilePath: \ainuo5213-decorators\src\core\route\factory.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'

export const generateRouteDecorator = (method: string) => {
  return (path: string): MethodDecorator => {
    return (_, _key, descriptor) => {
      Reflect.defineMetadata('method', method, descriptor.value!)
      Reflect.defineMetadata('path', path, descriptor.value!)
    }
  }
}
