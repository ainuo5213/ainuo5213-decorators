/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:52
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 20:12:50
 * @FilePath: \ainuo5213-decorators\src\packages\param\body.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { generateParameterDecorator } from '../../core/parameter/factory'
import {
  AbstractParameterResolver,
  ResolvedParameter
} from '../../core/parameter/factory'
import { IncomingMessage } from 'http'
import { Parameter } from '../../core/factory/decorator'

export const Body = generateParameterDecorator('body', false)

export class BodyParameterResolver extends AbstractParameterResolver {
  parameterFrom: string = 'body'
  resolveParameter(
    req: IncomingMessage,
    parameter: Parameter
  ): Promise<ResolvedParameter> {
    return new Promise((resolve, reject) => {
      let postBodyString = ''
      // 每次req都是个新的请求，所以不用解绑，由v8引擎自己维护
      const onChunk = (chunk: any) => {
        postBodyString += chunk
      }
      const onEnd = () => {
        const parmasObject = JSON.parse(postBodyString)
        resolve({
          parameterIndex: parameter.index,
          parameterValue: parmasObject,
          parameterFrom: parameter.paramFrom
        })
      }
      const onError = (err: Error) => {
        reject(err)
      }
      req.on('data', onChunk)
      req.on('end', onEnd)
      req.on('error', onError)
    })
  }
}
