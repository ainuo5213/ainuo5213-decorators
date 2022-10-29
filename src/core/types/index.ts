import { ServerResponse } from 'http'
import { BaseController } from '../controller'
import { ServiceValue } from '../dependency-injection/types'
import { MiddlewareType } from '../middleware'
import { AppModule } from '../module'
import { AsyncFunc, Parameter } from '../parameter'

export type ClassStruct<T extends any = any> = new (...args: any[]) => T

export interface IDisposed {
  dispose(): void
}

export type ModuleOption = Partial<{
  controllers: typeof BaseController[]
  modules: typeof AppModule[]
  middleware: MiddlewareType[]
}>

export interface ICollected {
  path: string
  requestMethod: string
  requestHandler: AsyncFunc
  requestHandlerParameters: Parameter[]
  middlewares: MiddlewareType[]
  requestController: typeof BaseController
  dependencies: Map<string, ServiceValue>
}

export const PathMetadataKey = Symbol('path')
export const MethodMetadataKey = Symbol('method')
export const ModuleMetadataKey = Symbol('module')
export const DesignParamTypesMetadataKey = 'design:paramtypes'
export const DesignTypeMetadataKey = 'design:type'
export const MiddlewareMetadataKey = Symbol('middleware')
export const AutowiredMetadataPropKey = Symbol('autowired-metadata-prop-key')
export const ApiPropertyMetadataKey = Symbol('api-property')
export const ValidateMetadataKey = Symbol('parameter-validation')
export const ValidateMetadataName = Symbol('parameter-validation-name')
export const ValidateMetadataProperty = Symbol('parameter-validation-property')

export const ParameterInvalidateHandlerName = Symbol('parameter-invalidate')
export const ErrorCapturedHandlerName = Symbol('error-captured')
export abstract class AbstractHandler {
  abstract readonly __flag: Symbol
  abstract handle(res: ServerResponse, ...args: any[]): void
}
