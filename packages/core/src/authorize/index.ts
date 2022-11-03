import 'reflect-metadata'
import { IncomingMessage, ServerResponse } from 'http'
import {
  AbstractHandler,
  AuthorizeContext,
  AuthorizeHandlerName,
  AuthorizeMetadataKey
} from '../types'

export abstract class AbstractAuthorizeHandler extends AbstractHandler {
  readonly __flag: Symbol = AuthorizeHandlerName
  abstract handle(res: ServerResponse, req: IncomingMessage): Promise<boolean>
}

export const defineAuthorizeDecorator = (
  anonymous: boolean
): MethodDecorator | ClassDecorator => {
  const context: AuthorizeContext = {
    anonymous: anonymous
  }
  return (target, propKey, descriptor) => {
    if (propKey === undefined && descriptor === undefined) {
      Reflect.defineMetadata(AuthorizeMetadataKey, context, target)
    } else {
      Reflect.defineMetadata(AuthorizeMetadataKey, context, descriptor.value!)
    }
  }
}

export const ClassAnonymous = (): ClassDecorator => {
  return defineAuthorizeDecorator(true) as ClassDecorator
}

export const MethodAnonymous = (): MethodDecorator => {
  return defineAuthorizeDecorator(true) as MethodDecorator
}

export const ClassAuthorize = (): ClassDecorator => {
  return defineAuthorizeDecorator(false) as ClassDecorator
}

export const MethodAuthorize = (): MethodDecorator => {
  return defineAuthorizeDecorator(false) as MethodDecorator
}
