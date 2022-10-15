import { Nullable } from './../../core/parameter/factory'
/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:52
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 20:56:22
 * @FilePath: \ainuo5213-decorators\src\packages\param\param.ts
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
import { ICollected } from '../../core/factory'
import { parse as parseUrl } from 'url'

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
