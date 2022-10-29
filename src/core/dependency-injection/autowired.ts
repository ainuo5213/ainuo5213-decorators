import 'reflect-metadata'
import { AutowiredMetadataPropKey } from '../types'

export type AutowiredMetadata = {
  autowiredKey: string
  autowiredType: Function
}

export const Autowired = (): PropertyDecorator => {
  return (target, propKey) => {
    const propType = Reflect.getMetadata(
      'design:type',
      target,
      propKey
    ) as Function
    const property: AutowiredMetadata = {
      autowiredKey: propKey as string,
      autowiredType: propType
    }
    const apiProperties =
      (Reflect.getMetadata(AutowiredMetadataPropKey, target) as
        | AutowiredMetadata[]
        | undefined) || []
    if (apiProperties.findIndex((r) => r.autowiredKey === propKey) === -1) {
      apiProperties.push(property)
    }

    Reflect.defineMetadata(AutowiredMetadataPropKey, apiProperties, target)
  }
}
