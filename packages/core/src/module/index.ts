import 'reflect-metadata'
import { BaseControllerResolver } from '../controller'
import { MiddlewareType } from '../middleware'
import {
  AuthorizeContext,
  AuthorizeMetadataKey,
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
    middlewares: MiddlewareType[] = [],
    anonymous: boolean = true
  ): ICollected[] {
    if (!this.controllerResolver) {
      throw new Error('controller resolver is not defined')
    }

    return this.controllerResolver.resolve(
      controllerClass,
      middlewares,
      anonymous
    )
  }
  resolve(
    module: Function,
    middlewares: MiddlewareType[] = [],
    anonymous: boolean = true
  ): ICollected[] {
    const prototype = module.prototype

    const moduleOption = Reflect.getMetadata(
      ModuleMetadataKey,
      prototype.constructor
    ) as ModuleOption | undefined

    const collectedData: ICollected[] = []
    if (!moduleOption) {
      return collectedData
    }

    const moduleAuthorizeContext = Reflect.getMetadata(
      AuthorizeMetadataKey,
      module
    ) as AuthorizeContext | undefined

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
        collectedData.push(
          ...this.resolveController(
            r,
            moduleMiddlewares,
            moduleAuthorizeContext
              ? moduleAuthorizeContext.anonymous
              : anonymous
          )
        )
      })
    }
    if (moduleOption?.modules?.length) {
      moduleOption.modules.forEach((r) => {
        collectedData.push(
          ...this.resolve(
            r,
            moduleMiddlewares,
            moduleAuthorizeContext
              ? moduleAuthorizeContext.anonymous
              : anonymous
          )
        )
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

export const Module = (option: ModuleOption): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof AppModule)) {
      throw new TypeError(target.name + ' not instance of ' + AppModule.name)
    }

    Reflect.defineMetadata(ModuleMetadataKey, option, target)
  }
}
