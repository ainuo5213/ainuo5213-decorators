/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 09:22:55
 * @FilePath: \ainuo5213-decorators\src\core\controller\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import { AutowiredMetadata } from '../dependency-injection/autowired'
import {
  AbstractServiceProviderFactory,
  Lifecycle,
  ServiceValue
} from '../dependency-injection/types'
import { MiddlewareType } from '../middleware'
import { AbstractParameterResolver, AsyncFunc, Parameter } from '../parameter'
import {
  AutowiredMetadataPropKey,
  ClassStruct,
  DesignParamTypesMetadataKey,
  ICollected,
  MethodMetadataKey,
  MiddlewareMetadataKey,
  PathMetadataKey
} from '../types'
import { extname } from 'path'

export enum StatusCode {
  NotFound = 404,
  InternalError = 500,
  NoContent = 204,
  Moved = 301,
  NotModified = 304,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  ServiceUnavilable = 503,
  Success = 200
}

export type StatusCodeType = StatusCode

export type JsonResult = {
  data: string
  statusCode: StatusCodeType
}

export type FileResult = {
  data: Buffer
  statusCode: StatusCodeType
}

export class BaseController {
  constructor(...args: any[]) {}

  private responseHeaders: Map<string, string> = new Map()
  private requestHeaders: Map<string, string> = new Map()

  setResponseHeader(key: string, value: string) {
    this.responseHeaders.set(key, value)
    return this
  }

  getResponseHeaders() {
    return this.responseHeaders
  }

  statusCode(result: { statusCode: StatusCodeType; data: unknown }) {
    this.responseHeaders.set('Content-Type', 'application/json')
    return {
      statusCode: result.statusCode,
      data: JSON.stringify(result.data)
    } as JsonResult
  }

  notFound(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.NotFound,
      data
    })
  }
  internalError(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.InternalError,
      data
    })
  }
  noContent(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.NoContent,
      data
    })
  }
  moved(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.Moved,
      data
    })
  }
  notModified(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.NotModified,
      data
    })
  }
  badRequest(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.BadRequest,
      data
    })
  }
  unauthorized(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.Unauthorized,
      data
    })
  }
  forbidden(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.Forbidden,
      data
    })
  }
  serviceUnavilable(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.ServiceUnavilable,
      data
    })
  }
  success(data: unknown) {
    return this.statusCode({
      statusCode: StatusCode.Success,
      data
    })
  }
  file(data: Buffer, filename: string) {
    const fileExtension = extname(filename)
    let filenameWithoutExtension = ''
    if (fileExtension) {
      filenameWithoutExtension = filename.slice(0, fileExtension.length)
    } else {
      filenameWithoutExtension = filename
    }
    this.responseHeaders.set(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(
        filenameWithoutExtension
      )}${fileExtension}`
    )
    this.responseHeaders.set(
      'Access-Control-Expose-Headers',
      'Content-Disposition'
    )
    this.responseHeaders.set('Content-Type', 'application/octet-stream')
    return {
      statusCode: StatusCode.Success,
      data
    } as FileResult
  }
}

export class BaseControllerResolver {
  protected parameterResolvers: Map<string, AbstractParameterResolver> =
    new Map()

  get(parameterFrom: string) {
    return this.parameterResolvers.get(parameterFrom)
  }

  useParameterResolvers(parameterResolver: AbstractParameterResolver) {
    if (!this.parameterResolvers.has(parameterResolver.parameterFrom)) {
      this.parameterResolvers.set(
        parameterResolver.parameterFrom,
        parameterResolver
      )
    }
  }

  resolveParameters(
    controller: Function,
    requestHandler: AsyncFunc
  ): Parameter[] {
    let parameter: Parameter[] = []
    this.parameterResolvers.forEach((r) => {
      const _parameters = r.getInjectParameters(controller, requestHandler)
      parameter = parameter.concat(_parameters)
    })

    return parameter
  }

  resolve(
    controller: Function,
    middlewares: MiddlewareType[] = []
  ): ICollected[] {
    const prototype = controller.prototype
    const controllerDepdencies = this.getControllerDependencies(controller)
    const controllerMiddleware =
      (Reflect.getMetadata(MiddlewareMetadataKey, controller) as
        | MiddlewareType[]
        | undefined) || []
    // 获取构造函数的path元数据
    const rootPath = Reflect.getMetadata(
      PathMetadataKey,
      prototype.constructor
    ) as string

    // 获取非构造函数的方法
    const methods = Reflect.ownKeys(prototype).filter(
      (item) => item !== 'constructor'
    ) as string[]

    const collected: ICollected[] = []

    for (let i = 0; i < methods.length; i++) {
      const methodKey = methods[i]
      const requestHandler = prototype[methodKey]

      // 获取方法的path元数据
      const path = Reflect.getMetadata(PathMetadataKey, requestHandler) as
        | string
        | undefined

      // 获取方法上请求方法的元数据
      const requestMethod = Reflect.getMetadata(
        MethodMetadataKey,
        requestHandler
      ) as string | undefined

      if (!path || !requestMethod) {
        continue
      }

      const routeMiddleware =
        (Reflect.getMetadata(
          MiddlewareMetadataKey,
          requestHandler,
          methodKey
        ) as MiddlewareType[] | undefined) || []
      const tmpResultMiddlewares = middlewares.concat(
        controllerMiddleware,
        routeMiddleware
      )

      // 去除重复注册的中间件
      const resultMiddlewares: MiddlewareType[] = []
      const resultMiddlewareNames: string[] = []
      tmpResultMiddlewares.forEach((middleware) => {
        if (!resultMiddlewareNames.includes(middleware.name)) {
          resultMiddlewareNames.push(middleware.name)
          resultMiddlewares.push(middleware)
        }
      })

      // 得到中间件的依赖项，并注入
      const middlewareDependencies =
        this.getMiddlewareDependencies(resultMiddlewares)
      const resultDependencies = this.mergeDependencies(
        controllerDepdencies,
        middlewareDependencies
      )

      // 解析函数参数的装饰器
      const parameters = this.resolveParameters(controller, requestHandler)
      collected.push({
        path: `${rootPath}${path}`,
        requestMethod,
        requestHandler,
        requestHandlerParameters: parameters,
        middlewares: resultMiddlewares,
        requestController: controller,
        dependencies: resultDependencies
      } as ICollected)
    }

    return collected
  }
  getControllerDependencies(controller: Function) {
    // 合并依赖
    const dependencies = this.getDependencies(controller)

    const controllerDependencies: Map<string, ServiceValue> = new Map()

    controllerDependencies.set(controller.name, {
      dependencies: dependencies,
      constructor: controller,
      option: {
        lifecycle: Lifecycle.transiant
      },
      resolveType: 'combination'
    })

    return controllerDependencies
  }
  getMiddlewareDependencies(middlewares: MiddlewareType[]) {
    const middlewareDependencies: Map<string, ServiceValue> = new Map()
    middlewares.forEach((r) => {
      const dependencies = this.getDependencies(r)

      middlewareDependencies.set(r.name, {
        dependencies: dependencies,
        constructor: r,
        option: {
          lifecycle: Lifecycle.transiant
        },
        resolveType: 'combination'
      })
    })
    return middlewareDependencies
  }
  getDependencies(item: Function) {
    const ctorParams =
      (Reflect.getMetadata(DesignParamTypesMetadataKey, item) as
        | ClassStruct[]
        | undefined) || []

    // 读取属性注入的参数
    const propertyParams =
      (Reflect.getMetadata(AutowiredMetadataPropKey, item.prototype) as
        | AutowiredMetadata[]
        | undefined) || []
    const ctorDependencies = this.resolveConstructorDependencies(ctorParams)
    const propDependencies = this.resolvePropertyDependencies(propertyParams)

    // 合并依赖
    const dependencies = this.mergeDependencies(
      ctorDependencies,
      propDependencies
    )
    return dependencies
  }
  mergeDependencies(
    ctorDependencies: Map<string, ServiceValue<any>>,
    propDependencies: Map<string, ServiceValue<any>>
  ): Map<string, ServiceValue> {
    const dependencies: Map<string, ServiceValue> = new Map()
    // 属性注入拥有更高的优先级
    propDependencies.forEach((r) => {
      if (!dependencies.has(r.constructor.name)) {
        dependencies.set(r.constructor.name, r)
      }
    })
    ctorDependencies.forEach((r) => {
      if (!dependencies.has(r.constructor.name)) {
        dependencies.set(r.constructor.name, r)
      }
    })
    return dependencies
  }

  resolveConstructorDependencies(params: ClassStruct[]) {
    const dependencies: Map<string, ServiceValue> = new Map()
    params.forEach((param) => {
      const injectedDependencyValue = Reflect.getMetadata(
        AbstractServiceProviderFactory.__flag,
        param
      ) as ServiceValue | undefined

      if (!injectedDependencyValue) {
        throw new Error(`${param.name}'s dependency is not injected`)
      }

      const ctorParams = Reflect.getMetadata(
        DesignParamTypesMetadataKey,
        param
      ) as ClassStruct[] | undefined

      if (ctorParams && ctorParams.length > 0) {
        injectedDependencyValue.dependencies =
          this.resolveConstructorDependencies(ctorParams)
      } else {
        injectedDependencyValue.dependencies = new Map()
      }
      injectedDependencyValue.resolveType = 'constructor'
      dependencies.set(
        injectedDependencyValue.constructor.name,
        injectedDependencyValue
      )
    })
    return dependencies
  }

  resolvePropertyDependencies(params: AutowiredMetadata[]) {
    const dependencies: Map<string, ServiceValue> = new Map()
    params.forEach((param) => {
      const propKey = param.autowiredKey
      const propType = param.autowiredType
      const injectedDependencyValue = Reflect.getMetadata(
        AbstractServiceProviderFactory.__flag,
        propType
      ) as ServiceValue | undefined
      if (!injectedDependencyValue) {
        throw new Error(
          `${param.autowiredType.name}'s dependency is not injected`
        )
      }

      const propertyParams =
        (Reflect.getMetadata(AutowiredMetadataPropKey, propType.prototype) as
          | AutowiredMetadata[]
          | undefined) || []
      if (propertyParams && propertyParams.length > 0) {
        injectedDependencyValue.dependencies =
          this.resolvePropertyDependencies(propertyParams)
      } else {
        injectedDependencyValue.dependencies = new Map()
      }
      injectedDependencyValue.resolveType = 'property'
      injectedDependencyValue.propKey = propKey

      dependencies.set(
        injectedDependencyValue.constructor.name,
        injectedDependencyValue
      )
    })

    return dependencies
  }
}
