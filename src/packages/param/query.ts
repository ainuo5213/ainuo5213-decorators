/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:48
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 18:37:23
 * @FilePath: \ainuo5213-decorators\src\packages\param\query.ts
 * @Description: Query装饰器
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import {
  AbstractParameterResolver,
  Nullable
} from '../../core/parameter/factory'
import { generateParameterDecorator } from '../../core/parameter/factory'
import { ResolvedParameter } from './../../core/parameter/factory'
import { parse as parseQuery } from 'querystring'
import { IncomingMessage } from 'http'
import { Parameter } from '../../core/factory/decorator'
import { parse as parseUrl } from 'url'

export const Query = generateParameterDecorator('query')

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
