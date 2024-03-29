import { ServerResponse } from 'http'
import { AbstractHandler, ErrorCapturedHandlerName, ICollected } from '../types'

export class ErrorResult {
  error: Error
  info: ICollected
  constructor(error: Error, info: ICollected) {
    this.error = error
    this.info = info
  }
  toString(): string {
    const res = {
      route: this.info.path,
      method: this.info.requestMethod,
      message: this.error.message,
      stack: this.error.stack
    }
    return JSON.stringify(res)
  }
}

export class ParameterInValidateResult {
  info: ICollected
  message: string
  constructor(info: ICollected, message: string) {
    this.message = message
    this.info = info
  }
  toString(): string {
    const res = {
      route: this.info.path,
      method: this.info.requestMethod,
      message: this.message
    }
    return JSON.stringify(res)
  }
}

export abstract class AbstractErrorHandler extends AbstractHandler {
  readonly __flag: Symbol = ErrorCapturedHandlerName
  abstract handle(res: ServerResponse, error: unknown): void
}
