import { IncomingMessage, ServerResponse } from 'http'
import {
  ControllerMiddlware,
  ModuleMiddlware,
  RouteMiddlware
} from '../src/core/middleware'

export class ModuleCorsMiddleware extends ModuleMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('ModuleCorsMiddleware')
    next()
  }
}

export class ModuleCorsMiddleware1 extends ModuleMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('ModuleCorsMiddleware1')
  }
}

export class ControllerCorsMiddleware extends ControllerMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('ControllerCorsMiddleware')
    next()
  }
}

export class RouteCorsMiddleware extends RouteMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('RouteCorsMiddleware')
    next()
  }
}
