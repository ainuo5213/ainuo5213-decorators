import 'reflect-metadata'
import { MethodMetadataKey, PathMetadataKey } from '../types'

export const defineRouteDecorator = (method: string) => {
  return (path: string): MethodDecorator => {
    return (_, _key, descriptor) => {
      Reflect.defineMetadata(MethodMetadataKey, method, descriptor.value!)
      Reflect.defineMetadata(PathMetadataKey, path, descriptor.value!)
    }
  }
}
