import { IncomingMessage } from 'http'
import { parse as parseUrl } from 'url'
import {
  AbstractParameterResolver,
  defineParameterDecorator,
  Nullable,
  Parameter,
  ResolvedParameter,
  ICollected
} from '@ainuo5213/core'

export const Param = defineParameterDecorator('param')

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
