/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:42:11
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 09:26:00
 * @FilePath: \ainuo5213-decorators\src\core\parameter\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { IncomingMessage } from 'http'
import { ICollected } from '../collected'
import 'reflect-metadata'

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
    const paramType = Reflect.getMetadata('design:paramtypes', target, propKey)

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

export function generateParameterDecorator(
  metadataKey: string
): (parameterName: string) => ParameterDecorator

export function generateParameterDecorator(
  metadataKey: string,
  transmitParameter: false
): () => ParameterDecorator
export function generateParameterDecorator(
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
