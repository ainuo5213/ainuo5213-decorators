import { IncomingMessage, ServerResponse } from 'http'

export abstract class AbsMiddleware {
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class ModuleMiddlware extends AbsMiddleware {
  readonly __module = true
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class ControllerMiddlware extends AbsMiddleware {
  readonly __controller = true
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class RouteMiddlware extends AbsMiddleware {
  readonly __route = true
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}
