import http from 'http'
import { parse as parseUrl } from 'url'
import { parse as parseQuery } from 'querystring'
import { BodySymbolId, Parameter } from '../request/decorator'
import { moduleFactory, ICollected } from '../request/factory'

export type ParameterObjectType = {
  parameterValue: any
  parameterIndex: number
}

export type CollectedValueType = Pick<
  ICollected,
  'path' | 'requestHandler' | 'requestMethod'
>

export default class Server<T extends Function> {
  collected: ICollected[] = []
  constructor(controller: T) {
    this.collected = moduleFactory(controller)
  }
  async listen(port: number) {
    http
      .createServer((req, res) => {
        let matched = false
        const { pathname } = parseUrl(req.url!)
        for (const info of this.collected) {
          // param类型的路由，需要进入内部解析才能得到是否匹配
          if (info.path!.includes('/:')) {
            matched = this.handleRequest(req, res, info)
          }
          // 非param类型的鲁豫
          else if (
            pathname === info.path &&
            req.method!.toLowerCase() === info.requestMethod.toLowerCase()
          ) {
            matched = this.handleRequest(req, res, info)
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

  handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    info: ICollected
  ): boolean {
    // 处理参数
    const { parameters, matched } = this.handleParameter(req, info)

    if (matched) {
      info
        .requestHandler(...parameters.map((r) => r.parameterValue))
        .then((data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
        })
    }
    return matched
  }

  handleParameter(
    req: http.IncomingMessage,
    info: ICollected
  ): {
    parameters: ParameterObjectType[]
    matched: boolean
  } {
    const resultParameters: ParameterObjectType[] = []
    const parameters = info.requestHandlerParameters
    let matched = false
    const infoValue = {
      path: info.path,
      requestHandler: info.requestHandler,
      requestMethod: info.requestMethod
    } as CollectedValueType
    console.log(parameters[0], parameters[1])
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i]

      if (parameter.paramFrom === BodySymbolId) {
      } else if (parameter.paramFrom === 'query') {
        // 是否匹配
        matched = true

        // 解析query参数
        const queryParameterObect = this.handleParameterFromQuery(
          req,
          parameter,
          infoValue
        )
        if (queryParameterObect) {
          resultParameters.push(queryParameterObect)
        }
      } else if (parameter.paramFrom === 'param') {
        const paramParameterObect = this.handleParameterFromParam(
          req,
          parameter,
          infoValue
        )
        // 如果返回的是boolean，则说明没有匹配到
        matched = typeof paramParameterObect !== 'boolean'

        if (!matched) {
          return {
            matched: false,
            parameters: []
          }
        }
        if (paramParameterObect) {
          resultParameters.push(paramParameterObect as ParameterObjectType)
        }
      }
    }

    resultParameters.sort((a, b) => a.parameterIndex - b.parameterIndex)

    return {
      matched: matched,
      parameters: resultParameters
    }
  }

  handleParameterFromQuery(
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

  handleParameterFromParam(
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
      parameterValue: paramValue
    }
  }
}
