/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:52
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 10:24:10
 * @FilePath: \ainuo5213-decorators\src\packages\parameter\param.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { IncomingMessage } from 'http'
import { parse as parseUrl } from 'url'
import { ICollected } from '../../core/collected'
import {
  AbstractParameterResolver,
  generateParameterDecorator,
  Nullable,
  Parameter,
  ResolvedParameter
} from '../../core/parameter'

export const Param = generateParameterDecorator('param')

export class ParamParameterResolver extends AbstractParameterResolver {
  parameterFrom: string = 'param'
  resolveParameter(
    req: IncomingMessage,
    parameter: Parameter,
    info: ICollected
  ): ResolvedParameter | Nullable {
    const { pathname } = parseUrl(req.url!)
    const { path: presetPathname } = info
    const { injectParameterKey: paramKey } = parameter

    const pathnameArray = pathname!.split('/').filter((r: string) => r)
    const presetPathnameArray = presetPathname.split('/').filter((r) => r)

    const presetPathnameIndex = presetPathnameArray.findIndex(
      (r) => r === `:${paramKey as string}`
    )

    if (presetPathnameIndex === -1) {
      return
    }

    // 得到匹配之后的param值
    const paramValue = pathnameArray[presetPathnameIndex]
    return {
      parameterIndex: parameter.index,
      parameterValue: paramValue,
      parameterFrom: parameter.paramFrom
    }
  }
}
