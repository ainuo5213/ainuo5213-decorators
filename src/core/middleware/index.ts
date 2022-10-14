import { IncomingMessage, ServerResponse } from 'http'

export abstract class AbsMiddleware {
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class ModuleMiddlware implements AbsMiddleware {
  __module = true
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class ControllerMiddlware implements AbsMiddleware {
  __controller = true
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}

export abstract class RouteMiddlware implements AbsMiddleware {
  __route = true
  abstract use(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ): void
}
