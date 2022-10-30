import { IncomingMessage } from 'http'
import { MiddlewareMetadataKey } from '../types'

export type MiddlewareFlagType = 'controller' | 'module' | 'route'

export abstract class AbstractMiddleware {
  constructor(...args: any[]) {}
  abstract readonly __flag: MiddlewareFlagType
  abstract use(request: IncomingMessage, next: () => void): void
}
export type MiddlewareType = typeof AbstractMiddleware

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
      Reflect.defineMetadata(MiddlewareMetadataKey, middlewares, target)
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
      Reflect.defineMetadata(
        MiddlewareMetadataKey,
        middlewares,
        descriptor.value!,
        key
      )
    }
  }
}
