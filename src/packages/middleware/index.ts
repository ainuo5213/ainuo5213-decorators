/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-16 09:33:31
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 09:48:12
 * @FilePath: \ainuo5213-decorators\src\packages\middleware\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import {
  ControllerMiddlware,
  ModuleMiddlware,
  RouteMiddlware,
  MiddlewareType
} from '../../core/middleware'

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

function getMiddlewares(middlewares: MiddlewareType[] | MiddlewareType) {
  let _middlewares
  if (!Array.isArray(middlewares)) {
    _middlewares = [middlewares]
  } else {
    _middlewares = middlewares
  }
  return _middlewares
}

export function InjectClassMiddleware(
  middlewares: MiddlewareType[] | MiddlewareType
): ClassDecorator {
  return (target) => {
    const _middlewares = getMiddlewares(middlewares)
    const isError = checkTypeError(_middlewares, (middleware) => {
      return (
        middleware.prototype instanceof ModuleMiddlware ||
        middleware.prototype instanceof ControllerMiddlware
      )
    })
    if (isError) {
      throw new TypeError('inject middleware error')
    } else {
      Reflect.defineMetadata('middleware', _middlewares, target)
    }
  }
}

export function InjectMethodMiddleware(
  middlewares: MiddlewareType[] | MiddlewareType
): MethodDecorator {
  return (target, key, descriptor) => {
    const _middlewares = getMiddlewares(middlewares)
    const isError = checkTypeError(_middlewares, (middleware) => {
      return middleware.prototype instanceof RouteMiddlware
    })
    if (isError) {
      throw new TypeError('inject middleware error')
    } else {
      Reflect.defineMetadata('middlware', _middlewares, descriptor.value!, key)
    }
  }
}
