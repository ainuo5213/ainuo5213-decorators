/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-25 22:10:41
 * @FilePath: \ainuo5213-decorators\src\core\controller\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import {
  AutowiredMetadata,
  autowiredMetadataPropKey
} from '../dependency-injection/autowired'
import {
  AbstractServiceProviderFactory,
  ServiceValue
} from '../dependency-injection/types'
import { MiddlewareType } from '../middleware'
import { AbstractParameterResolver, AsyncFunc, Parameter } from '../parameter'
import { ClassStruct, ICollected } from '../types'
export class BaseController {
  private static context: any
  constructor(...args: any[]) {}
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

    // 读取构造函数的参数
    const ctorParams =
      (Reflect.getMetadata('design:paramtypes', controller) as
        | ClassStruct[]
        | undefined) || []

    // 读取属性注入的参数
    const propertyParams =
      (Reflect.getMetadata(autowiredMetadataPropKey, prototype) as
        | AutowiredMetadata[]
        | undefined) || []

    const ctorDependencies = this.resolveConstructorDependencies(ctorParams)
    const propDependencies = this.resolvePropertyDependencies(propertyParams)
    // 合并依赖
    const dependencies = this.mergeDependencies(
      ctorDependencies,
      propDependencies
    )

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
        requestController: controller,
        dependencies: dependencies
      } as ICollected)
    }

    return collected
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
      console.log(injectedDependencyValue)

      if (!injectedDependencyValue) {
        throw new Error(`${param.name}'s dependency is not injected`)
      }

      const ctorParams = Reflect.getMetadata('design:paramtypes', param) as
        | ClassStruct[]
        | undefined

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
        (Reflect.getMetadata(autowiredMetadataPropKey, propType.prototype) as
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
