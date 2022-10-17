import 'reflect-metadata'
import { ICollected } from '../collected'
import { MiddlewareType } from '../middleware'
import { AbstractParameterResolver, AsyncFunc, Parameter } from '../parameter'

/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 11:03:10
 * @FilePath: \ainuo5213-decorators\src\core\controller\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
export class BaseController {
  private static context: any
  get context() {
    return BaseController.context
  }

  set context(context: any) {
    BaseController.context = context
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

    // 获取构造函数的path元数据
    const rootPath = Reflect.getMetadata(
      'path',
      prototype.constructor
    ) as string

    const controllerMiddleware =
      (Reflect.getMetadata('middlware', prototype.constructor) as
        | MiddlewareType[]
        | undefined) || []

    // 获取非构造函数的方法
    const methods = Reflect.ownKeys(prototype).filter(
      (item) => item !== 'constructor'
    ) as string[]

    const collected: ICollected[] = []

    for (let i = 0; i < methods.length; i++) {
      const methodKey = methods[i]
      const requestHandler = prototype[methodKey]

      // 获取方法的path元数据
      const path = Reflect.getMetadata('path', requestHandler) as
        | string
        | undefined

      // 获取方法上请求方法的元数据
      const requestMethod = Reflect.getMetadata('method', requestHandler) as
        | string
        | undefined

      if (!path || !requestMethod) {
        continue
      }

      const routeMiddleware =
        (Reflect.getMetadata('middleware', requestHandler, methodKey) as
          | MiddlewareType[]
          | undefined) || []
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

      // 解析函数参数的装饰器
      const parameters = this.resolveParameters(controller, requestHandler)

      collected.push({
        path: `${rootPath}${path}`,
        requestMethod,
        requestHandler,
        requestHandlerParameters: parameters,
        middlewares: resultMiddlewares,
        requestInstance: controller.prototype as BaseController
      } as ICollected)
    }

    return collected
  }
}