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
