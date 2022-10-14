import { IncomingMessage, ServerResponse } from 'http'

type MiddlewareType = 'controller' | 'module' | 'route'
export abstract class AbsMiddleware {
  abstract readonly __flag: MiddlewareType
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class ModuleMiddlware extends AbsMiddleware {
  readonly __flag: MiddlewareType = 'module'
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class ControllerMiddlware extends AbsMiddleware {
  readonly __flag: MiddlewareType = 'controller'
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class RouteMiddlware extends AbsMiddleware {
  readonly __flag: MiddlewareType = 'route'
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}
