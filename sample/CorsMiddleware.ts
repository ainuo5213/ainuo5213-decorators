import { IncomingMessage, ServerResponse } from 'http'
import { AbstractMiddleware, MiddlewareFlagType } from '../src/core/middleware'
import { ToyService } from './toy.service'

export class ControllerCorsMiddleware extends AbstractMiddleware {
  __flag: MiddlewareFlagType = 'controller'
  constructor(private toyService: ToyService) {
    super()
  }
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log('ControllerCorsMiddleware', this.toyService.getObj())
    this.configContext('userAage', {
      age: 18
    })
    next()
  }
}

console.log(Reflect.getMetadata('design:paramtypes', ControllerCorsMiddleware))
