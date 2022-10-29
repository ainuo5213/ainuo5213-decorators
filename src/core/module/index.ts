/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 08:32:35
 * @FilePath: \ainuo5213-decorators\src\core\module\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import 'reflect-metadata'
import { BaseControllerResolver } from '../controller'
import { MiddlewareType } from '../middleware'
import {
  ICollected,
  MiddlewareMetadataKey,
  ModuleMetadataKey,
  ModuleOption
} from '../types'

export class AppModule {}

export type MaybeNull<T> = T | null

export class BaseModuleResolver {
  private controllerResolver: MaybeNull<BaseControllerResolver> = null

  useControllerResolver(resolver: BaseControllerResolver): void {
    this.controllerResolver = resolver
  }
  getControllerResolver() {
    return this.controllerResolver
  }
  resolveController(
    controllerClass: Function,
    middlewares: MiddlewareType[] = []
  ): ICollected[] {
    if (!this.controllerResolver) {
      throw new Error('controller resolver is not defined')
    }

    return this.controllerResolver.resolve(controllerClass, middlewares)
  }
  resolve(module: Function, middlewares: MiddlewareType[] = []): ICollected[] {
    const prototype = module.prototype

    const moduleOption = Reflect.getMetadata(
      ModuleMetadataKey,
      prototype.constructor
    ) as ModuleOption | undefined

    const collectedData: ICollected[] = []
    if (!moduleOption) {
      return collectedData
    }

    let moduleMiddlewares: MiddlewareType[] = []

    if (moduleOption?.middleware?.length) {
      moduleMiddlewares = middlewares.concat(moduleOption.middleware)
    }

    moduleMiddlewares = moduleMiddlewares.concat(
      (Reflect.getMetadata(MiddlewareMetadataKey, prototype.constructor) as
        | MiddlewareType[]
        | undefined) || []
    )

    if (moduleOption?.controllers?.length) {
      moduleOption.controllers.forEach((r) => {
        collectedData.push(...this.resolveController(r, moduleMiddlewares))
      })
    }
    if (moduleOption?.modules?.length) {
      moduleOption.modules.forEach((r) => {
        collectedData.push(...this.resolve(r, moduleMiddlewares))
      })
    }

    // 验重
    const mappedCollection = collectedData.map((r) => r.path + r.requestMethod)
    const beforeLength = mappedCollection.length
    const afterLength = new Set(mappedCollection).size
    if (beforeLength !== afterLength) {
      throw new Error('含有重复的路由')
    }

    return collectedData
  }
}
