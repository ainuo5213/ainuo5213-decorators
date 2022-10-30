import { IncomingMessage } from 'http'
import {
  AbstractParameterResolver,
  defineParameterDecorator,
  Parameter,
  ResolvedParameter
} from '@ainuo5213/core'

export const Header = defineParameterDecorator('header')

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
