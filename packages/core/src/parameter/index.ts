import { IncomingMessage, ServerResponse } from 'http'
import 'reflect-metadata'
import {
  AbstractHandler,
  ApiPropertyMetadataKey,
  DesignParamTypesMetadataKey,
  DesignTypeMetadataKey,
  ICollected,
  ParameterInvalidateHandlerName
} from '../types'

export type AsyncFunc = (...args: any[]) => Promise<any>
export type Parameter = {
  index: number
  injectParameterKey: string | symbol
  paramFrom: string
  paramType: unknown
}

export const generateParameterResolver = (metadataKey: string) => {
  return (object: Function, handler: AsyncFunc) => {
    const objectParameterMetadatas: Parameter[] = []
    for (let i = 0; i < handler.length; i++) {
      const metadata = Reflect.getMetadata(
        metadataKey,
        object.prototype,
        `${handler.name}.${i}`
      ) as Parameter

      if (metadata) {
        objectParameterMetadatas.push(metadata)
      }
    }
    return objectParameterMetadatas
  }
}

export type ResolvedParameter = {
  parameterIndex: number
  parameterValue: unknown
  parameterFrom: string
}

export type Nullable = undefined | null
export type MaybePromise<T> = Promise<T> | T

export abstract class AbstractParameterResolver {
  abstract parameterFrom: string
  getInjectParameters(controller: Function, requestHandler: AsyncFunc) {
    return generateParameterResolver(this.parameterFrom)(
      controller,
      requestHandler
    )
  }
  abstract resolveParameter(
    req: IncomingMessage,
    parameter: Parameter,
    info: ICollected
  ): MaybePromise<ResolvedParameter> | Nullable
}

function addParameter(
  metadataKey: string,
  from: string,
  parameterName: string
): ParameterDecorator {
  return (target, propKey, paramIndex) => {
    const paramType = Reflect.getMetadata(
      DesignParamTypesMetadataKey,
      target,
      propKey
    )

    const parameter = {
      index: paramIndex,
      injectParameterKey: parameterName,
      paramFrom: from,
      paramType: paramType[0]
    } as Parameter

    Reflect.defineMetadata(
      metadataKey,
      parameter,
      target,
      `${propKey as string}.${paramIndex}`
    )
  }
}

export function defineParameterDecorator(
  metadataKey: string
): (parameterName: string) => ParameterDecorator

export function defineParameterDecorator(
  metadataKey: string,
  transmitParameter: false
): () => ParameterDecorator
export function defineParameterDecorator(
  metadataKey: string,
  transmitParameter: boolean = true
) {
  if (transmitParameter) {
    return (parameterName: string): ParameterDecorator =>
      addParameter(metadataKey, metadataKey, parameterName)
  } else {
    return (): ParameterDecorator =>
      addParameter(metadataKey, metadataKey, metadataKey)
  }
}

export type ApiPropertyType = {
  propertyType: Function
  propertyKey: string
}

export const ApiProperty = (): PropertyDecorator => {
  return (target, propKey) => {
    const propType = Reflect.getMetadata(
      DesignTypeMetadataKey,
      target,
      propKey
    ) as Function
    const property: ApiPropertyType = {
      propertyKey: propKey as string,
      propertyType: propType
    }
    const apiProperties =
      (Reflect.getMetadata(ApiPropertyMetadataKey, target) as
        | ApiPropertyType[]
        | undefined) || []
    if (apiProperties.findIndex((r) => r.propertyKey === propKey) === -1) {
      apiProperties.push(property)
    }

    Reflect.defineMetadata(ApiPropertyMetadataKey, apiProperties, target)
  }
}

export abstract class AbstractParameterInValidateHandler extends AbstractHandler {
  readonly __flag: Symbol = ParameterInvalidateHandlerName
  abstract handle(res: ServerResponse, message: string): void
}
