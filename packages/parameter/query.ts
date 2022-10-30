import { parse as parseQuery } from 'qs'
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

export const Query = defineParameterDecorator('query')
export const ModelQuery = defineParameterDecorator('modelQuery', false)

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

    return {
      parameterValue: instance,
      parameterIndex: parameter.index,
      parameterFrom: parameter.paramFrom
    }
  }
}
