import http from 'http'
import { parse as parseUrl } from 'url'
import { parse as parseQuery } from 'querystring'
import { CorsPolicy, Parameter, ParameterFromType } from '../request/decorator'
import { moduleFactory, ICollected } from '../request/factory'
import multiparty, { Part } from 'multiparty'

export type ParameterObjectType = {
  parameterValue: any
  paramFrom: ParameterFromType
  parameterIndex: number
}

export type FileInfoData = {
  fileData: any
  fileName: string
  fieldName: string
}

export type FileParameterObjectType = ParameterObjectType & {
  fileInfo: FileInfoData
}

export type FilesParameterObjectType = ParameterObjectType & {
  fileInfos: FileInfoData[]
}

export type FileParameterData = {
  fileInfo: {
    fieldName: string
    fileName: string
  }
  fileData: any
}

export type CollectedValueType = Pick<
  ICollected,
  'path' | 'requestHandler' | 'requestMethod'
>

export default class Server<T extends Function> {
  collected: ICollected[] = []
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
      info
        .requestHandler(
          ...parameters.map((r) => {
            if (r.paramFrom === 'file') {
              const currentData = r as FileParameterObjectType
              return {
                fileInfo: {
                  fileName: currentData.fileInfo.fileName,
                  fieldName: currentData.fileInfo.fieldName
                },
                fileData: currentData.fileInfo.fileData
              } as FileParameterData
            } else if (r.paramFrom === 'files') {
              const currentData = r as FilesParameterObjectType
              return currentData.fileInfos.map((r) => {
                return {
                  fileData: r.fileData,
                  fileInfo: {
                    fieldName: r.fieldName,
                    fileName: r.fileName
                  }
                } as FileParameterData
              })
            }

            return r.parameterValue
          })
        )
        .then((data) => {
          if (info.corsPolicy) {
            this.setCorsPolicy(res, info.corsPolicy)
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
        })
    }
    return matched
  }

  private setCorsPolicy(res: http.ServerResponse, policy: CorsPolicy) {
    policy.headers &&
      res.setHeader('Access-Control-Allow-Headers', policy.headers)
    policy.methods &&
      res.setHeader('Access-Control-Allow-Methods', policy.methods)
    policy.origin && res.setHeader('Access-Control-Allow-Origin', policy.origin)
    policy.credentials &&
      res.setHeader(
        'Access-Control-Allow-Credentials',
        String(policy.credentials)
      )
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
      } else if (parameter.paramFrom === 'file') {
        const fileParameterObject = await this.handleParameterFromFile(
          req,
          parameter,
          infoValue
        )
        if (fileParameterObject) {
          resultParameters.push(fileParameterObject)
        }
      } else if (parameter.paramFrom === 'files') {
        const filesParameterObject = await this.handleParameterFromFiles(
          req,
          parameter,
          infoValue
        )
        if (filesParameterObject) {
          resultParameters.push(filesParameterObject)
        }
      }
    }

    resultParameters.sort((a, b) => a.parameterIndex - b.parameterIndex)

    return {
      matched: matched,
      parameters: resultParameters
    }
  }

  private handleParameterFromFiles(
    req: http.IncomingMessage,
    parameter: Parameter,
    infoValue: CollectedValueType
  ): Promise<ParameterObjectType> {
    const form = new multiparty.Form()
    form.parse(req)
    let fileInfos: FileInfoData[] = []
    return new Promise((resolve, reject) => {
      form.on('part', (part: Part) => {
        const buffer: Buffer[] = []
        part.on('data', (chunk) => {
          buffer.push(chunk)
        })
        part.on('end', () => {
          fileInfos.push({
            fieldName: part.name,
            fileData: buffer,
            fileName: part.filename
          })
        })
      })
      form.on('close', () => {
        resolve({
          parameterIndex: parameter.index,
          parameterValue: fileInfos.map((r) => r.fileData),
          paramFrom: parameter.paramFrom,
          fileInfos: fileInfos
        } as FilesParameterObjectType)
      })
      form.on('error', (err) => {
        reject(err)
      })
    })
  }

  private handleParameterFromFile(
    req: http.IncomingMessage,
    parameter: Parameter,
    infoValue: CollectedValueType
  ): Promise<ParameterObjectType> {
    const form = new multiparty.Form()
    form.parse(req)
    let fileInfo: FileParameterObjectType
    return new Promise((resolve, reject) => {
      form.on('part', (part: Part) => {
        fileInfo = {
          parameterIndex: parameter.index,
          parameterValue: part,
          paramFrom: parameter.paramFrom,
          fileInfo: {
            fileName: part.filename,
            fieldName: part.name,
            fileData: part
          }
        } as FileParameterObjectType
        if (fileInfo.fileInfo.fileData.name === parameter.injectParameterKey) {
          resolve(fileInfo)
        } else {
          reject(new Error('文件名和装饰器定义的文件名不同'))
        }
      })
      form.on('error', (err) => {
        reject(err)
      })
    })
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
