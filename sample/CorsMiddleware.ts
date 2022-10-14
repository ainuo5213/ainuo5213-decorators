import { IncomingMessage, ServerResponse } from 'http'
import { ModuleMiddlware } from '../src/core/middleware'

export default class CorsMiddleware extends ModuleMiddlware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    console.log(1111)
  }
}
