import 'reflect-metadata'
import { BaseController } from '../controller'
import {
  AbsMiddleware,
  ControllerMiddlware,
  ModuleMiddlware,
  RouteMiddlware
} from '../middleware'
import { AppModule } from '../module'

type UppercaseMethod =
  | 'GET'
  | 'POST'
  | 'OPTION'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
export type Method = UppercaseMethod | Lowercase<UppercaseMethod>

export enum METADATA_KEY {
  METHOD = 'ioc:method',
  PATH = 'ioc:path',
  MIDDLEWARE = 'ioc:middleware',
  MODULE = 'ioc:module',
  PARAMETER = 'ioc:parameter'
}

export const Controller = (path?: string): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof BaseController)) {
      throw new TypeError(
        target.name + ' not instance of ' + BaseController.name
      )
    }
    Reflect.defineMetadata(METADATA_KEY.PATH, path ?? '', target)
  }
}

export type MiddlewareType = typeof AbsMiddleware

export type ModuleOption = Partial<{
  controllers: typeof BaseController[]
  modules: typeof AppModule[]
  middleware: MiddlewareType[]
}>

export const Module = (option: ModuleOption): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof AppModule)) {
      throw new TypeError(target.name + ' not instance of ' + AppModule.name)
    }

    Reflect.defineMetadata(METADATA_KEY.MODULE, option, target)
  }
}

export type Parameter = {
  index: number
  injectParameterKey: string | symbol
  paramFrom: string
}

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
      Reflect.defineMetadata(METADATA_KEY.MIDDLEWARE, _middlewares, target)
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
      Reflect.defineMetadata(
        METADATA_KEY.MIDDLEWARE,
        _middlewares,
        descriptor.value!,
        key
      )
    }
  }
}
