/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:10:45
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 18:37:19
 * @FilePath: \ainuo5213-decorators\src\packages\param\header.ts
 * @Description: Header装饰器
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

export const Header = generateParameterDecorator('header')

export class HeaderParameterResolver extends AbstractParameterResolver {
  parameterFrom: string = 'header'
  resolveParameter(
    req: IncomingMessage,
    parameter: Parameter
  ): ResolvedParameter {
    const value =
      req.headers[(parameter.injectParameterKey as string).toLowerCase()]
    return {
      parameterIndex: parameter.index,
      parameterValue: value,
      parameterFrom: parameter.paramFrom
    }
  }
}
