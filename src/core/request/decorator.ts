import 'reflect-metadata'

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
    return (_target, _key, descriptor) => {
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

const parameterDecoratorFactory = (metadataKey: METADATA_KEY) => {
  const paramFrom = metadataKey.slice('ioc:'.length) as ParameterFromType
  return (parameterName: ParameterType): ParameterDecorator =>
    addParameter(metadataKey, paramFrom, parameterName)
}

const bodyDecoratorFactory = (metadataKey: METADATA_KEY) => {
  return (): ParameterDecorator =>
    addParameter(metadataKey, 'body', BodySymbolId)
}

export const Controller = (path?: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEY.PATH, path ?? '', target)
  }
}

export type ModuleOption = Partial<{
  controllers: Function[]
  modules: Function[]
}>

export const Module = (option: ModuleOption): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEY.MODULE, option, target)
  }
}

export const BodySymbolId = Symbol('body')
export type ParameterFromType = 'query' | 'param' | 'body' | 'header' | 'file'
export type Parameter = {
  index: number
  injectParameterKey: string | symbol
  paramFrom: ParameterFromType
}

// 参数装饰器
export const Param = parameterDecoratorFactory(METADATA_KEY.PARAM)
export const Query = parameterDecoratorFactory(METADATA_KEY.QUERY)
export const Body = bodyDecoratorFactory(METADATA_KEY.BODY)
export const Header = parameterDecoratorFactory(METADATA_KEY.HEADER)
export const File = parameterDecoratorFactory(METADATA_KEY.File)

// 方法装饰器
export const Get = methodDecoratorFactory(REQUEST_METHOD.GET)
export const Post = methodDecoratorFactory(REQUEST_METHOD.POST)
export const Option = methodDecoratorFactory(REQUEST_METHOD.OPTION)
export const Put = methodDecoratorFactory(REQUEST_METHOD.PUT)
export const Patch = methodDecoratorFactory(REQUEST_METHOD.PATCH)
export const Delete = methodDecoratorFactory(REQUEST_METHOD.DELETE)
export const Head = methodDecoratorFactory(REQUEST_METHOD.HEAD)
