import {
  Method,
  METADATA_KEY,
  ModuleOption,
  Parameter,
  CorsPolicy
} from './decorator'

type AsyncFunc = (...args: any[]) => Promise<any>

export interface ICollected {
  path: string
  requestMethod: Method
  requestHandler: AsyncFunc
  corsPolicy: CorsPolicy
  requestHandlerParameters: Parameter[]
}

export const moduleFactory = <T extends Function>(
  moduleClass: T,
  corsPolicy: CorsPolicy | undefined = undefined
) => {
  const prototype = moduleClass.prototype

  const moduleOption = Reflect.getMetadata(
    METADATA_KEY.MODULE,
    prototype.constructor
  ) as ModuleOption | undefined

  const moduleCorsPolicy = Reflect.getMetadata(
    METADATA_KEY.Cors,
    prototype.constructor
  ) as CorsPolicy | undefined

  const collectedData: ICollected[] = []
  if (moduleOption?.controllers?.length) {
    moduleOption.controllers.forEach((r) => {
      collectedData.push(...routerFactory(r, moduleCorsPolicy || corsPolicy))
    })
  }
  if (moduleOption?.modules?.length) {
    moduleOption.modules.forEach((r) => {
      collectedData.push(...moduleFactory(r, moduleCorsPolicy || corsPolicy))
    })
  }

  // 验重
  const mappedCollection = collectedData.map((r) => r.path + r.requestMethod)
  const beforeLength = mappedCollection.length
  const afterLength = new Set(mappedCollection).size
  if (beforeLength !== afterLength) {
    throw new Error('含有重复的路由')
  }

  return collectedData
}

const routerFactory = <T extends Function>(
  controllerClass: T,
  moduleCorsPolicy: CorsPolicy | undefined = undefined
): ICollected[] => {
  const prototype = controllerClass.prototype

  // 获取构造函数的path元数据
  const rootPath = Reflect.getMetadata(
    METADATA_KEY.PATH,
    prototype.constructor
  ) as string

  const controllerCorsPolicy = Reflect.getMetadata(
    METADATA_KEY.Cors,
    prototype.constructor
  ) as CorsPolicy | undefined

  // 获取非构造函数的方法
  const methods = Reflect.ownKeys(prototype).filter(
    (item) => item !== 'constructor'
  ) as string[]

  const collected = methods.map((methodKey) => {
    const requestHandler = prototype[methodKey]

    // 获取方法的path元数据
    const path = <string>Reflect.getMetadata(METADATA_KEY.PATH, requestHandler)

    // 获取方法上请求方法的元数据
    const requestMethod = (
      Reflect.getMetadata(METADATA_KEY.METHOD, requestHandler).replace(
        'ioc:',
        ''
      ) as string
    ).toUpperCase() as Method
    const queryParameterMetadatas = queryFactory(
      controllerClass,
      requestHandler
    )
    const paramParameterMetadatas = paramFactory(
      controllerClass,
      requestHandler
    )
    const bodyParameterMetadatas = bodyFactory(controllerClass, requestHandler)
    const headerParameterMetadatas = headerFactory(
      controllerClass,
      requestHandler
    )
    const fileParameterMetadatas = fileFactory(controllerClass, requestHandler)
    const filesParameterMetadatas = filesFactory(
      controllerClass,
      requestHandler
    )
    const methodCorsPolicy = Reflect.getMetadata(
      METADATA_KEY.Cors,
      controllerClass.prototype,
      requestHandler.name
    ) as CorsPolicy | undefined
    return {
      path: `${rootPath}${path}`,
      requestMethod,
      requestHandler,
      corsPolicy: methodCorsPolicy || controllerCorsPolicy || moduleCorsPolicy,
      requestHandlerParameters: queryParameterMetadatas.concat(
        paramParameterMetadatas,
        bodyParameterMetadatas,
        headerParameterMetadatas,
        fileParameterMetadatas,
        filesParameterMetadatas
      )
    } as ICollected
  })

  return collected
}

const parameterFactory = (metadataKey: METADATA_KEY) => {
  return (object: Function, handler: AsyncFunc) => {
    const objectParameterMetadatas: Parameter[] = []
    for (let i = 0; i < handler.length; i++) {
      const metadata = Reflect.getMetadata(
        metadataKey,
        object.prototype,
        `${handler.name}.${i}`
      ) as Parameter
      if (metadata) {
        objectParameterMetadatas.push(metadata)
      }
    }
    return objectParameterMetadatas
  }
}

const paramFactory = parameterFactory(METADATA_KEY.PARAM)
const queryFactory = parameterFactory(METADATA_KEY.QUERY)
const bodyFactory = parameterFactory(METADATA_KEY.BODY)
const headerFactory = parameterFactory(METADATA_KEY.HEADER)
const fileFactory = parameterFactory(METADATA_KEY.File)
const filesFactory = parameterFactory(METADATA_KEY.Files)
