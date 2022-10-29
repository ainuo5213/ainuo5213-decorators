import { IncomingMessage, ServerResponse } from 'http'
import { Autowired } from '../src/core/dependency-injection/autowired'
import { AbstractMiddleware, MiddlewareFlagType } from '../src/core/middleware'
import { ToyService } from './toy.service'

export class ControllerCorsMiddleware extends AbstractMiddleware {
  __flag: MiddlewareFlagType = 'controller'
  @Autowired()
  toyService: ToyService
  constructor() {
    super()
  }
  use(req: IncomingMessage, next: () => void) {
    console.log('ControllerCorsMiddleware', this.toyService.getObj())
    next()
  }
}
