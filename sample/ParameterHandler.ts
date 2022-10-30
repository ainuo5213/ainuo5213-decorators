import { AbstractParameterInValidateHandler } from '@ainuo5213/core'
import { ServerResponse } from 'http'

export class ParameterInvalidateHandler extends AbstractParameterInValidateHandler {
  handle(res: ServerResponse, message: string): void {
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        code: 400,
        message: message,
        data: null
      })
    )
  }
}
