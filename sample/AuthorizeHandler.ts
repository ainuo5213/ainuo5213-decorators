import { AbstractAuthorizeHandler } from '@ainuo5213/core/authorize'
import { ServerResponse, IncomingMessage } from 'http'

export class AuthorizeHandler extends AbstractAuthorizeHandler {
  async handle(
    res: ServerResponse<IncomingMessage>,
    req: IncomingMessage
  ): Promise<boolean> {
    if (!req.headers['ainuo5213']) {
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          code: 0,
          message: '用户认证失败'
        })
      )
      return false
    }
    return true
  }
}
