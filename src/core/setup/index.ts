import http, { IncomingMessage } from 'http'
import { parse as parseUrl } from 'url'
import {
  METADATA_KEY,
  MiddlewareType,
  ModuleOption,
  Parameter
} from '../factory/decorator'
import { ICollected } from '../factory'
import { AbsMiddleware } from '../middleware'
import {
  AbstractParameterResolver,
  AsyncFunc,
  ResolvedParameter
} from '../parameter/factory'
import { BaseController } from '../controller'

export type ParameterObjectType = {
  parameterValue: any
  paramFrom: string
  parameterIndex: number
}

export type CollectedValueType = Pick<
  ICollected,
  'path' | 'requestHandler' | 'requestMethod'
>

export default class Server<T extends Function> {
  private collected: ICollected[] = []
  private static instance: Server<Function>
  private parameterResolvers: Map<string, AbstractParameterResolver> = new Map()
  private constructor(module: T) {
    if (!module) {
      throw new TypeError('injectModule is nullable')
    }
    setTimeout(() => {
      this.collected = this.resolveModule(module)
    })
  }

  public use(parameterResolver: AbstractParameterResolver) {
    if (!this.parameterResolvers.has(parameterResolver.parameterFrom)) {
      this.parameterResolvers.set(
        parameterResolver.parameterFrom,
        parameterResolver
      )
    }
    return this
  }

  public async listen(port: number) {
    http
      .createServer(async (req, res) => {
        const { pathname } = parseUrl(req.url!)

        for (const info of this.collected) {
          if (this.isMatch(info, req, pathname!)) {
            await this.handleRequest(req, res, info)
            return
          }
        }
        return res.end('not found')
      })
      .listen(port)
  }

  public static create(module: Function) {
    if (!Server.instance) {
      Server.instance = new Server(module)
    }
    return Server.instance
  }

  private resolveModule(module: Function, middlewares: MiddlewareType[] = []) {
    const prototype = module.prototype

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
        collectedData.push(...this.resolveController(r, moduleMiddlewares))
      })
    }
    if (moduleOption?.modules?.length) {
      moduleOption.modules.forEach((r) => {
        collectedData.push(...this.resolveModule(r, moduleMiddlewares))
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

  private resolveController(
    controllerClass: Function,
    middlewares: MiddlewareType[] = []
  ) {
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

    const collected: ICollected[] = []

    for (let i = 0; i < methods.length; i++) {
      const methodKey = methods[i]
      const requestHandler = prototype[methodKey]

      // 获取方法的path元数据
      const path = Reflect.getMetadata(METADATA_KEY.PATH, requestHandler) as
        | string
        | undefined

      // 获取方法上请求方法的元数据
      const requestMethod = Reflect.getMetadata(
        METADATA_KEY.METHOD,
        requestHandler
      ) as string | undefined

      if (!path || !requestMethod) {
        continue
      }

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
      const parameters = this.resolveParameters(controllerClass, requestHandler)

      collected.push({
        path: `${rootPath}${path}`,
        requestMethod,
        requestHandler,
        requestHandlerParameters: parameters,
        middlewares: resultMiddlewares,
        requestInstance: controllerClass.prototype as BaseController
      } as ICollected)
    }

    return collected
  }

  private resolveParameters(controller: Function, requestHandler: AsyncFunc) {
    let parameter: Parameter[] = []
    this.parameterResolvers.forEach((r) => {
      const _parameters = r.getInjectParameters(controller, requestHandler)
      parameter = parameter.concat(_parameters)
    })

    return parameter
  }

  private isMatch(info: ICollected, req: IncomingMessage, pathname: string) {
    // /:id这样类型的需要后面拼接路由才能判断是否正确
    if (pathname.includes('/:')) {
      return this.isMatchParam(info, pathname)
    }

    return this.collected.find(
      (r) =>
        r.path.toLowerCase() === pathname.toLowerCase() &&
        (r.requestMethod.toLowerCase() === req.method!.toLowerCase()) !== null
    )
  }

  private isMatchParam(info: ICollected, pathname: string) {
    // 预设的含有param的路由，例如 /user/:id
    const { path: presetPathname } = info

    // 开始对比
    const presetPathNameParams = presetPathname.split('/')
    const realPathNameParams = pathname.split('/')
    while (presetPathNameParams.length > 0) {
      const presetPathNameParam = presetPathNameParams.shift()
      const realPathNameParam = realPathNameParams.shift()

      if (!presetPathNameParam) {
        return realPathNameParams.length === 0
      }
      // 预设的parameter以':'开头，则判断realPathNameParam有无，没有表示不匹配
      if (presetPathNameParam.startsWith(':') && !realPathNameParam) {
        return false
      }
    }

    if (presetPathNameParams.length === 0 && realPathNameParams.length === 0) {
      return true
    }

    return false
  }

  private async invokeMiddleware(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    info: ICollected
  ) {
    const context: Map<any, unknown> = new Map()
    if (info.middlewares.length) {
      const next = async () => {
        const middleware = info.middlewares.shift()
        if (middleware) {
          const middlewareInstance = Reflect.construct(
            middleware as Function,
            []
          ) as AbsMiddleware

          try {
            const result = await Promise.resolve(
              middlewareInstance.use(req, res, next)
            )
            const { key, context: _context } =
              middlewareInstance.getConfigContext()

            context.set(key, _context)
            return result
          } catch (err) {
            return Promise.reject(err)
          }
        } else {
          return Promise.resolve()
        }
      }
      await next()
    }

    return context
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    info: ICollected
  ) {
    // 处理参数
    const parameters = await this.handleParameter(req, info)

    const context: Map<any, unknown> = await this.invokeMiddleware(
      req,
      res,
      info
    )
    info.requestInstance.context = context
    info.requestHandler
      .bind(info.requestInstance)(
        ...parameters.map((r) => {
          return r.parameterValue
        })
      )
      .then(async (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(data))
      })
  }

  private async handleParameter(
    req: http.IncomingMessage,
    info: ICollected
  ): Promise<ResolvedParameter[]> {
    const resultParameters: ResolvedParameter[] = []
    const parameters = info.requestHandlerParameters

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i]
      const parameterResolver = this.parameterResolvers.get(parameter.paramFrom)

      if (parameterResolver) {
        let parameterObject = parameterResolver.resolveParameter(
          req,
          parameter,
          info
        )

        if (parameterObject instanceof Promise) {
          parameterObject = await parameterObject
        }

        if (!parameterObject) {
          continue
        }

        resultParameters.push(parameterObject)
      }
      //  else if (parameter.paramFrom === 'param') {
      //   const paramParameterObject = this.handleParameterFromParam(
      //     req,
      //     parameter,
      //     infoValue
      //   )
      //   // 如果返回的是boolean，则说明没有匹配到
      //   matched = typeof paramParameterObject !== 'boolean'

      //   if (!matched) {
      //     return {
      //       matched: false,
      //       parameters: []
      //     }
      //   }
      //   if (paramParameterObject) {
      //     resultParameters.push(paramParameterObject as ParameterObjectType)
      //   }
      // }
    }

    resultParameters.sort((a, b) => a.parameterIndex - b.parameterIndex)

    return resultParameters
  }

  // private handleParameterFromBody(
  //   req: http.IncomingMessage,
  //   parameter: Parameter,
  //   infoValue: CollectedValueType
  // ): Promise<ParameterObjectType> {
  //   return new Promise((resolve, reject) => {
  //     let postBodyString = ''
  //     // 每次req都是个新的请求，所以不用解绑，由v8引擎自己维护
  //     const onChunk = (chunk: any) => {
  //       postBodyString += chunk
  //     }
  //     const onEnd = () => {
  //       const parmasObject = JSON.parse(postBodyString)
  //       resolve({
  //         parameterIndex: parameter.index,
  //         parameterValue: parmasObject,
  //         paramFrom: parameter.paramFrom
  //       })
  //     }
  //     const onError = (err: Error) => {
  //       reject(err)
  //     }
  //     req.on('data', onChunk)
  //     req.on('end', onEnd)
  //     req.on('error', onError)
  //   })
  // }

  // private handleParameterFromParam(
  //   req: http.IncomingMessage,
  //   parameter: Parameter,
  //   infoValue: CollectedValueType
  // ): ParameterObjectType | false {
  //   // url解析得到的实际的路由，例如 /user/100
  //   const { pathname } = parseUrl(req.url!)

  //   // 预设的含有param的路由，例如 /user/:id
  //   const { path: presetPathname } = infoValue

  //   // 需要解析的预设的param key
  //   const { injectParameterKey: paramKey } = parameter

  //   // 如何检验是同一路由，这里采用path以/分割之后的个数一样且预设的paramkey和路由中注入的param key一样
  //   const pathnameArray = pathname!.split('/').filter((r) => r)
  //   const presetPathnameArray = presetPathname.split('/').filter((r) => r)
  //   let matched =
  //     pathnameArray?.length === presetPathnameArray.length &&
  //     presetPathnameArray.includes(`:${paramKey as string}`)

  //   if (!matched) {
  //     return false
  //   }

  //   // 对照之后，进行param匹配
  //   const presetPathnameIndex = presetPathnameArray.findIndex(
  //     (r) => r === `:${paramKey as string}`
  //   )

  //   // 得到匹配之后的param值
  //   const paramValue = pathnameArray[presetPathnameIndex]
  //   return {
  //     parameterIndex: parameter.index,
  //     parameterValue: paramValue,
  //     paramFrom: parameter.paramFrom
  //   }
  // }
}
