/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 09:47:19
 * @FilePath: \ainuo5213-decorators\src\core\middleware\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { IncomingMessage, ServerResponse } from 'http'

export type MiddlewareFlagType = 'controller' | 'module' | 'route'

export abstract class AbstractMiddleware {
  abstract readonly __flag: MiddlewareFlagType
  private __key: any
  private __context: unknown
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void

  configContext(key: any, context: unknown) {
    this.__context = context
    this.__key = key
  }

  getConfigContext() {
    return {
      key: this.__key,
      context: this.__context
    }
  }
}

export type MiddlewareType = typeof AbstractMiddleware

export abstract class ModuleMiddlware extends AbstractMiddleware {
  readonly __flag: MiddlewareFlagType = 'module'
}

export abstract class ControllerMiddlware extends AbstractMiddleware {
  readonly __flag: MiddlewareFlagType = 'controller'
}

export abstract class RouteMiddlware extends AbstractMiddleware {
  readonly __flag: MiddlewareFlagType = 'route'
}
