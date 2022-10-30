import { IncomingMessage } from 'http'
import {
  Autowired,
  AbstractMiddleware,
  MiddlewareFlagType
} from '@ainuo5213/core'
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
