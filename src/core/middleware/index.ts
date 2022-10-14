import { IncomingMessage, ServerResponse } from 'http'

type MiddlewareType = 'controller' | 'module' | 'route'
export abstract class AbsMiddleware {
  abstract readonly __flag: MiddlewareType
  private __key: any
  private __context: unknown
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void

  configContext(key: any, context: unknown) {
    this.__context = context
    this.__key = key
  }

  getConfigContext() {
    return {
      key: this.__key,
      context: this.__context
    }
  }
}

export abstract class ModuleMiddlware extends AbsMiddleware {
  readonly __flag: MiddlewareType = 'module'
}

export abstract class ControllerMiddlware extends AbsMiddleware {
  readonly __flag: MiddlewareType = 'controller'
}

export abstract class RouteMiddlware extends AbsMiddleware {
  readonly __flag: MiddlewareType = 'route'
}
