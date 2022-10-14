import { IncomingMessage, ServerResponse } from 'http'
import {
  ControllerMiddlware,
  ModuleMiddlware,
  RouteMiddlware
} from '../src/core/middleware'

export class ModuleCorsMiddleware extends ModuleMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('ModuleCorsMiddleware')
    this.configContext('username', {
      name: 'ainuo5213'
    })
    next()
  }
}

export class ControllerCorsMiddleware extends ControllerMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('ControllerCorsMiddleware')
    this.configContext('userAage', {
      age: 18
    })
    next()
  }
}

export class RouteCorsMiddleware extends RouteMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('RouteCorsMiddleware')
    this.configContext('userHeight', '167')
    next()
  }
}
