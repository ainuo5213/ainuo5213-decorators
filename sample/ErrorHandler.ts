import { ServerResponse } from 'http'
import { AbstractErrorHandler } from '@ainuo5213/core'

export class ErrorHandler extends AbstractErrorHandler {
  handle(res: ServerResponse, error: unknown): void {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify((error as Error).message))
  }
}
