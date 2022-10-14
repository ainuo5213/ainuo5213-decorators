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
  PARAM = 'ioc:param',
  QUERY = 'ioc:query',
  BODY = 'ioc:body',
  HEADER = 'ioc:header',
  File = 'ioc:file',
  Files = 'ioc:files'
}

enum REQUEST_METHOD {
  GET = 'ioc:get',
  POST = 'ioc:post',
  OPTION = 'ioc:option',
  PUT = 'ioc:put',
  PATCH = 'ioc:patch',
  DELETE = 'ioc:delete',
  HEAD = 'ioc:head'
}

const methodDecoratorFactory = (method: REQUEST_METHOD) => {
  return (path: string): MethodDecorator => {
    return (_, _key, descriptor) => {
      Reflect.defineMetadata(METADATA_KEY.METHOD, method, descriptor.value!)
      Reflect.defineMetadata(METADATA_KEY.PATH, path, descriptor.value!)
    }
  }
}

type ParameterType = string | symbol

function addParameter(
  metadataKey: METADATA_KEY,
  paramFrom: ParameterFromType,
  parameterName: ParameterType
): ParameterDecorator {
  return (target, propKey, paramIndex) => {
    const parameter: Parameter = {
      index: paramIndex,
      injectParameterKey: parameterName,
      paramFrom: paramFrom
    }

    Reflect.defineMetadata(
      metadataKey,
      parameter,
      target,
      `${propKey as string}.${paramIndex}`
    )
  }
}

const parameterMoreDecoratorFactory = (metadataKey: METADATA_KEY) => {
  const paramFrom = metadataKey.slice('ioc:'.length) as ParameterFromType
  return (parameterName: ParameterType): ParameterDecorator =>
    addParameter(metadataKey, paramFrom, parameterName)
}

const parameterWithoutDecoratorFactory = (metadataKey: METADATA_KEY) => {
  const paramFrom = metadataKey.slice('ioc:'.length) as ParameterFromType
  return (): ParameterDecorator =>
    addParameter(metadataKey, paramFrom, BodySymbolId)
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

const BodySymbolId = Symbol('body')
export type ParameterFromType =
  | 'query'
  | 'param'
  | 'body'
  | 'header'
  | 'file'
  | 'files'
export type Parameter = {
  index: number
  injectParameterKey: string | symbol
  paramFrom: ParameterFromType
}

// 参数装饰器
export const Param = parameterMoreDecoratorFactory(METADATA_KEY.PARAM)
export const Query = parameterMoreDecoratorFactory(METADATA_KEY.QUERY)
export const Body = parameterWithoutDecoratorFactory(METADATA_KEY.BODY)
export const Header = parameterMoreDecoratorFactory(METADATA_KEY.HEADER)
export const File = parameterMoreDecoratorFactory(METADATA_KEY.File)
export const Files = parameterWithoutDecoratorFactory(METADATA_KEY.Files)

// 方法装饰器
export const Get = methodDecoratorFactory(REQUEST_METHOD.GET)
export const Post = methodDecoratorFactory(REQUEST_METHOD.POST)
export const Option = methodDecoratorFactory(REQUEST_METHOD.OPTION)
export const Put = methodDecoratorFactory(REQUEST_METHOD.PUT)
export const Patch = methodDecoratorFactory(REQUEST_METHOD.PATCH)
export const Delete = methodDecoratorFactory(REQUEST_METHOD.DELETE)
export const Head = methodDecoratorFactory(REQUEST_METHOD.HEAD)

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
