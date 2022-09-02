import { Method, METADATA_KEY, ModuleOption } from './decorator'

type AsyncFunc = (...args: any[]) => Promise<any>

export interface ICollected {
  path: string
  requestMethod: Method
  requestHandler: AsyncFunc
}

export const moduleFactory = <T extends Function>(moduleClass: T) => {
  const prototype = moduleClass.prototype

  const moduleOption = Reflect.getMetadata(
    METADATA_KEY.MODULE,
    prototype.constructor
  ) as ModuleOption | undefined

  const collectedData: ICollected[] = []
  if (moduleOption?.controllers?.length) {
    moduleOption.controllers.forEach((r) => {
      collectedData.push(...routerFactory(r))
    })
  }
  if (moduleOption?.modules?.length) {
    moduleOption.modules.forEach((r) => {
      collectedData.push(...moduleFactory(r))
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

export const routerFactory = <T extends Function>(
  controllerClass: T
): ICollected[] => {
  const prototype = controllerClass.prototype

  // 获取构造函数的path元数据
  const rootPath = Reflect.getMetadata(
    METADATA_KEY.PATH,
    prototype.constructor
  ) as string

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

    return {
      path: `${rootPath}${path}`,
      requestMethod,
      requestHandler
    } as ICollected
  })

  return collected
}
