/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:52
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-25 21:31:22
 * @FilePath: \ainuo5213-decorators\src\packages\parameter\body.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { IncomingMessage } from 'http'
import {
  AbstractParameterResolver,
  ApiPropertyMetadataKey,
  ApiPropertyType,
  generateParameterDecorator,
  Parameter,
  ResolvedParameter
} from '../../core/parameter'
import { ICollected } from '../../core/types'

export const Body = generateParameterDecorator('body', false)

export class BodyParameterResolver extends AbstractParameterResolver {
  parameterFrom: string = 'body'
  resolveParameter(
    req: IncomingMessage,
    parameter: Parameter,
    info: ICollected
  ): Promise<ResolvedParameter> {
    return new Promise((resolve, reject) => {
      let postBodyString = ''
      // 每次req都是个新的请求，所以不用解绑，由v8引擎自己维护
      const onChunk = (chunk: any) => {
        postBodyString += chunk
      }
      const onEnd = () => {
        const parmasObject = JSON.parse(postBodyString)

        const instance = Reflect.construct(parameter.paramType as Function, [])
        const apiProperties: ApiPropertyType[] = Reflect.getMetadata(
          ApiPropertyMetadataKey,
          instance
        )

        apiProperties.forEach((r) => {
          const queryObjectItem = parmasObject[r.propertyKey]
          if (queryObjectItem !== undefined) {
            instance[r.propertyKey] = queryObjectItem
          }
        })

        resolve({
          parameterIndex: parameter.index,
          parameterValue: instance,
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
