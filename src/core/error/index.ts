/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-29 09:32:22
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 19:59:37
 * @FilePath: \ainuo5213-decorators\src\core\error\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { IncomingMessage, ServerResponse } from 'http'
import { AbstractHandler, ErrorCapturedHandlerName, ICollected } from '../types'

export class ErrorResult {
  error: Error
  info: ICollected
  constructor(error: Error, info: ICollected) {
    this.error = error
    this.info = info
  }
  toString(): string {
    const res = {
      route: this.info.path,
      method: this.info.requestMethod,
      cause: this.error.cause,
      message: this.error.message,
      stack: this.error.stack
    }
    return JSON.stringify(res)
  }
}

export class ParameterInValidateResult {
  info: ICollected
  message: string
  constructor(info: ICollected, message: string) {
    this.message = message
    this.info = info
  }
  toString(): string {
    const res = {
      route: this.info.path,
      method: this.info.requestMethod,
      message: this.message
    }
    return JSON.stringify(res)
  }
}

export abstract class AbstractErrorHandler extends AbstractHandler {
  readonly __flag: Symbol = ErrorCapturedHandlerName
  abstract handle(res: ServerResponse, error: unknown): void
}
