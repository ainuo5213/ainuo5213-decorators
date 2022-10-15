import http from 'http'
import { parse as parseUrl } from 'url'
import { parse as parseQuery } from 'querystring'
import { Parameter, ParameterFromType } from '../factory/decorator'
import { moduleFactory, ICollected } from '../factory'
import { AbsMiddleware } from '../middleware'

export type ParameterObjectType = {
  parameterValue: any
  paramFrom: ParameterFromType
  parameterIndex: number
}

export type CollectedValueType = Pick<
  ICollected,
  'path' | 'requestHandler' | 'requestMethod'
>

export default class Server<T extends Function> {
  private collected: ICollected[] = []
  private static instance: Server<Function>
  private constructor(module: T) {
    this.collected = moduleFactory(module)
  }
  public static create(module: Function) {
    if (!Server.instance) {
      Server.instance = new Server(module)
    }
    return Server.instance
  }
  public async listen(port: number) {
    http
      .createServer(async (req, res) => {
        let matched = false
        const { pathname } = parseUrl(req.url!)

        for (const info of this.collected) {
          // param类型的路由，需要进入内部解析才能得到是否匹配
          if (info.path!.includes('/:')) {
            matched = await this.handleRequest(req, res, info)
          }
          // 非param类型的鲁豫
          else if (
            pathname === info.path &&
            req.method!.toLowerCase() === info.requestMethod.toLowerCase()
          ) {
            matched = await this.handleRequest(req, res, info)
          } else {
            matched = false
          }
          if (matched) {
            break
          }
        }
        if (!matched) {
          res.end('not found')
        }
      })
      .listen(port)
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    info: ICollected
  ): Promise<boolean> {
    // 处理参数
    const { parameters, matched } = await this.handleParameter(req, info)

    if (matched) {
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
    return matched
  }

  private async handleParameter(
    req: http.IncomingMessage,
    info: ICollected
  ): Promise<{
    parameters: ParameterObjectType[]
    matched: boolean
  }> {
    const resultParameters: ParameterObjectType[] = []
    const parameters = info.requestHandlerParameters
    let matched = true
    const infoValue = {
      path: info.path,
      requestHandler: info.requestHandler,
      requestMethod: info.requestMethod
    } as CollectedValueType

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i]
      if (parameter.paramFrom === 'body') {
        const bodyParameterObject = await this.handleParameterFromBody(
          req,
          parameter,
          infoValue
        )
        if (bodyParameterObject) {
          resultParameters.push(bodyParameterObject)
        }
      } else if (parameter.paramFrom === 'query') {
        // 解析query参数
        const queryParameterObject = this.handleParameterFromQuery(
          req,
          parameter,
          infoValue
        )
        if (queryParameterObject) {
          resultParameters.push(queryParameterObject)
        }
      } else if (parameter.paramFrom === 'param') {
        const paramParameterObject = this.handleParameterFromParam(
          req,
          parameter,
          infoValue
        )
        // 如果返回的是boolean，则说明没有匹配到
        matched = typeof paramParameterObject !== 'boolean'

        if (!matched) {
          return {
            matched: false,
            parameters: []
          }
        }
        if (paramParameterObject) {
          resultParameters.push(paramParameterObject as ParameterObjectType)
        }
      } else if (parameter.paramFrom === 'header') {
        const headerParameterObject = this.handleParameterFromHeader(
          req,
          parameter,
          infoValue
        )
        if (headerParameterObject) {
          resultParameters.push(headerParameterObject)
        }
      }
    }

    resultParameters.sort((a, b) => a.parameterIndex - b.parameterIndex)

    return {
      matched: matched,
      parameters: resultParameters
    }
  }

  private handleParameterFromHeader(
    req: http.IncomingMessage,
    parameter: Parameter,
    infoValue: CollectedValueType
  ): ParameterObjectType {
    const value =
      req.headers[(parameter.injectParameterKey as string).toLowerCase()]
    return {
      parameterIndex: parameter.index,
      parameterValue: value,
      paramFrom: parameter.paramFrom
    }
  }

  private handleParameterFromBody(
    req: http.IncomingMessage,
    parameter: Parameter,
    infoValue: CollectedValueType
  ): Promise<ParameterObjectType> {
    return new Promise((resolve, reject) => {
      let postBodyString = ''
      // 每次req都是个新的请求，所以不用解绑，由v8引擎自己维护
      const onChunk = (chunk: any) => {
        postBodyString += chunk
      }
      const onEnd = () => {
        const parmasObject = JSON.parse(postBodyString)
        resolve({
          parameterIndex: parameter.index,
          parameterValue: parmasObject,
          paramFrom: parameter.paramFrom
        })
      }
      const onError = (err: Error) => {
        reject(err)
      }
      req.on('data', onChunk)
      req.on('end', onEnd)
      req.on('error', onError)
    })
  }

  private handleParameterFromQuery(
    req: http.IncomingMessage,
    parameter: Parameter,
    infoValue: CollectedValueType
  ): ParameterObjectType | null {
    const { query = '' } = parseUrl(req.url!)
    if (!query) {
      return null
    }
    const queryObject = parseQuery(query)
    const paramKey = parameter.injectParameterKey as string
    return {
      parameterValue: queryObject[paramKey],
      parameterIndex: parameter.index
    } as ParameterObjectType
  }

  private handleParameterFromParam(
    req: http.IncomingMessage,
    parameter: Parameter,
    infoValue: CollectedValueType
  ): ParameterObjectType | false {
    // url解析得到的实际的路由，例如 /user/100
    const { pathname } = parseUrl(req.url!)

    // 预设的含有param的路由，例如 /user/:id
    const { path: presetPathname } = infoValue

    // 需要解析的预设的param key
    const { injectParameterKey: paramKey } = parameter

    // 如何检验是同一路由，这里采用path以/分割之后的个数一样且预设的paramkey和路由中注入的param key一样
    const pathnameArray = pathname!.split('/').filter((r) => r)
    const presetPathnameArray = presetPathname.split('/').filter((r) => r)
    let matched =
      pathnameArray?.length === presetPathnameArray.length &&
      presetPathnameArray.includes(`:${paramKey as string}`)

    if (!matched) {
      return false
    }

    // 对照之后，进行param匹配
    const presetPathnameIndex = presetPathnameArray.findIndex(
      (r) => r === `:${paramKey as string}`
    )

    // 得到匹配之后的param值
    const paramValue = pathnameArray[presetPathnameIndex]
    return {
      parameterIndex: parameter.index,
      parameterValue: paramValue,
      paramFrom: parameter.paramFrom
    }
  }
}
