/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-16 09:33:31
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-28 21:34:07
 * @FilePath: \ainuo5213-decorators\src\packages\middleware\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import { AbstractMiddleware, MiddlewareType } from '../../core/middleware'

function checkTypeError(
  middlewares: MiddlewareType[],
  predict: (middleware: MiddlewareType) => boolean
) {
  const typeErrorLength = middlewares
    .map((middleware) => {
      return predict(middleware)
    })
    .filter((r) => !r).length

  return typeErrorLength > 1
}

export function InjectClassMiddleware(
  ...middlewares: MiddlewareType[]
): ClassDecorator {
  return (target) => {
    const isError = checkTypeError(middlewares, (middleware) => {
      return middleware.prototype instanceof AbstractMiddleware
    })
    if (isError) {
      throw new TypeError('inject middleware error')
    } else {
      Reflect.defineMetadata('middleware', middlewares, target)
    }
  }
}

export function InjectMethodMiddleware(
  ...middlewares: MiddlewareType[]
): MethodDecorator {
  return (target, key, descriptor) => {
    const isError = checkTypeError(middlewares, (middleware) => {
      return middleware.prototype instanceof AbstractMiddleware
    })
    if (isError) {
      throw new TypeError('inject middleware error')
    } else {
      Reflect.defineMetadata('middlware', middlewares, descriptor.value!, key)
    }
  }
}
