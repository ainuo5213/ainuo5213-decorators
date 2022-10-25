/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:48
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 21:15:20
 * @FilePath: \ainuo5213-decorators\src\packages\parameter\query.ts
 * @Description: Query装饰器
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { parse as parseQuery } from 'qs'
import { IncomingMessage } from 'http'
import { parse as parseUrl } from 'url'
import {
  AbstractParameterResolver,
  generateParameterDecorator,
  Nullable,
  Parameter,
  ResolvedParameter
} from '../../core/parameter'
import { ICollected } from '../../core/types'

export const Query = generateParameterDecorator('query')
export const ModelQuery = generateParameterDecorator('modelQuery', false)

export class QueryParameterResolver extends AbstractParameterResolver {
  parameterFrom: string = 'query'
  resolveParameter(
    req: IncomingMessage,
    parameter: Parameter
  ): ResolvedParameter | Nullable {
    const { query = '' } = parseUrl(req.url!)
    if (!query) {
      return
    }
    const queryObject = parseQuery(query)
    const paramKey = parameter.injectParameterKey as string
    return {
      parameterValue: queryObject[paramKey],
      parameterIndex: parameter.index,
      parameterFrom: parameter.paramFrom
    }
  }
}

export class ModelQueryParameterResolver extends AbstractParameterResolver {
  parameterFrom: string = 'modelQuery'
  resolveParameter(
    req: IncomingMessage,
    parameter: Parameter,
    info: ICollected
  ): ResolvedParameter | Nullable {
    const { query = '' } = parseUrl(req.url!)
    const queryObject = parseQuery(query!)

    if (typeof parameter.paramType !== 'function') {
      throw new TypeError(`${info.requestMethod}'s parameter is not a class`)
    }
    const instance = Reflect.construct(parameter.paramType as Function, [])
    Reflect.ownKeys(instance).forEach((r) => {
      const queryObjectItem = queryObject[r as string]
      if (queryObjectItem !== undefined) {
        instance[r] = queryObjectItem
      }
    })
    console.log(instance, parameter.paramType)

    return {
      parameterValue: instance,
      parameterIndex: parameter.index,
      parameterFrom: parameter.paramFrom
    }
  }
}
