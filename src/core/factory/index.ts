import { BaseController } from '../controller'
import { AsyncFunc, generateParameterResolver } from '../parameter/factory'
import {
  Method,
  METADATA_KEY,
  ModuleOption,
  Parameter,
  MiddlewareType
} from './decorator'

export interface ICollected {
  path: string
  requestMethod: Method
  requestHandler: AsyncFunc
  requestHandlerParameters: Parameter[]
  middlewares: MiddlewareType[]
  requestInstance: BaseController
}

export const moduleFactory = <T extends Function>(
  moduleClass: T,
  middlewares: MiddlewareType[] = []
) => {
  const prototype = moduleClass.prototype

  const moduleOption = Reflect.getMetadata(
    METADATA_KEY.MODULE,
    prototype.constructor
  ) as ModuleOption | undefined
  const collectedData: ICollected[] = []
  if (!moduleOption) {
    return collectedData
  }

  let moduleMiddlewares: MiddlewareType[] = []

  if (moduleOption?.middleware?.length) {
    moduleMiddlewares = middlewares.concat(moduleOption.middleware)
  }

  moduleMiddlewares = moduleMiddlewares.concat(
    (Reflect.getMetadata(METADATA_KEY.MIDDLEWARE, prototype.constructor) as
      | MiddlewareType[]
      | undefined) || []
  )

  if (moduleOption?.controllers?.length) {
    moduleOption.controllers.forEach((r) => {
      collectedData.push(...routerFactory(r, moduleMiddlewares))
    })
  }
  if (moduleOption?.modules?.length) {
    moduleOption.modules.forEach((r) => {
      collectedData.push(...moduleFactory(r, moduleMiddlewares))
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
  middlewares: MiddlewareType[]
): ICollected[] => {
  const prototype = controllerClass.prototype

  // 获取构造函数的path元数据
  const rootPath = Reflect.getMetadata(
    METADATA_KEY.PATH,
    prototype.constructor
  ) as string

  const controllerMiddleware =
    (Reflect.getMetadata(METADATA_KEY.MIDDLEWARE, prototype.constructor) as
      | MiddlewareType[]
      | undefined) || []

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

    const routeMiddleware =
      (Reflect.getMetadata(
        METADATA_KEY.MIDDLEWARE,
        requestHandler,
        methodKey
      ) as MiddlewareType[] | undefined) || []
    const tmpResultMiddlewares = middlewares.concat(
      controllerMiddleware,
      routeMiddleware
    )

    // 去除重复注册的中间件
    const resultMiddlewares: MiddlewareType[] = []
    const resultMiddlewareNames: string[] = []
    tmpResultMiddlewares.forEach((middleware) => {
      if (!resultMiddlewareNames.includes(middleware.name)) {
        resultMiddlewareNames.push(middleware.name)
        resultMiddlewares.push(middleware)
      }
    })

    // 解析函数参数的装饰器

    const queryParameterMetadatas = queryFactory(
      controllerClass,
      requestHandler
    )
    // const paramParameterMetadatas = paramFactory(
    //   controllerClass,
    //   requestHandler
    // )
    // const bodyParameterMetadatas = bodyFactory(controllerClass, requestHandler)
    const headerParameterMetadatas = headerFactory(
      controllerClass,
      requestHandler
    )
    return {
      path: `${rootPath}${path}`,
      requestMethod,
      requestHandler,
      requestHandlerParameters: queryParameterMetadatas.concat(
        // paramParameterMetadatas,
        // bodyParameterMetadatas,
        headerParameterMetadatas
      ),
      middlewares: resultMiddlewares,
      requestInstance: controllerClass.prototype as BaseController
    } as ICollected
  })

  return collected
}

// const paramFactory = parameterFactory(METADATA_KEY.PARAM)
const queryFactory = generateParameterResolver(METADATA_KEY.QUERY)
// const bodyFactory = parameterFactory(METADATA_KEY.BODY)
// const headerFactory = generateParameterResolver(METADATA_KEY.HEADER)
