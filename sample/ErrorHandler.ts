/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-29 20:00:58
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 20:21:25
 * @FilePath: \ainuo5213-decorators\sample\ErrorHandler.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { ServerResponse } from 'http'
import { AbstractErrorHandler } from '../src/core/error'

export class ErrorHandler extends AbstractErrorHandler {
  handle(res: ServerResponse, error: unknown): void {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify((error as Error).message))
  }
}
