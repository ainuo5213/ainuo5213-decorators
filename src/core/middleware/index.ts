/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 08:47:52
 * @FilePath: \ainuo5213-decorators\src\core\middleware\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { IncomingMessage, ServerResponse } from 'http'

export type MiddlewareFlagType = 'controller' | 'module' | 'route'

export abstract class AbstractMiddleware {
  constructor(...args: any[]) {}
  abstract readonly __flag: MiddlewareFlagType
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}
export type MiddlewareType = typeof AbstractMiddleware
