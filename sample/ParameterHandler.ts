/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-29 20:21:18
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 20:22:40
 * @FilePath: \ainuo5213-decorators\sample\ParameterHandler.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { ServerResponse } from 'http'
import { AbstractParameterInValidateHandler } from '../src/core/parameter'

export class ParameterInvalidateHandler extends AbstractParameterInValidateHandler {
  handle(res: ServerResponse, message: string): void {
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        code: 400,
        message: message,
        data: null
      })
    )
  }
}
