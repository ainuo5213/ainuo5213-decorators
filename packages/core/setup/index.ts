import http, { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import {
  AbstractParameterInValidateHandler,
  AbstractParameterResolver,
  Parameter,
  ResolvedParameter
} from '../parameter'
import { BaseModuleResolver } from '../module'
import { AbstractMiddleware } from '../middleware'
import { MaybeNull } from '../module'
import {
  BaseController,
  BaseControllerResolver,
  ControllerResult
} from '../controller'
import {
  AbstractContainer,
  AbstractContainerBuilder,
  AbstractServiceProviderFactory
} from '../dependency-injection/types'
import {
  AbstractHandler,
  AuthorizeHandlerName,
  ErrorCapturedHandlerName,
  ICollected,
  ParameterInvalidateHandlerName,
  ValidateMetadataKey,
  ValidateMetadataName
} from '../types'
import { AbstractValidationFilter, ValidateResult } from '../validate'
import {
  AbstractErrorHandler,
  ErrorResult,
  ParameterInValidateResult
} from '../error'
import { AbstractAuthorizeHandler } from '../authorize'

export type ParameterObjectType = {
  parameterValue: any
  paramFrom: string
  parameterIndex: number
}

export type CollectedValueType = Pick<
  ICollected,
  'path' | 'requestHandler' | 'requestMethod'
>

enum Urgency {
  LowestPriority = 0,
  General = 1,
  Preference = 2
}

type UseFunction = {
  invoke: () => void
  urgency: Urgency
}

export class Server<T extends Function = Function> {
  private collected: ICollected[] = []
  private static instance: Server<Function>
  private moduleResolver: MaybeNull<BaseModuleResolver> = null
  private controllerResolver: MaybeNull<BaseControllerResolver> = null
  private useFunctionStack: UseFunction[] = []
  private serviceProviderFactory: MaybeNull<AbstractServiceProviderFactory> =
    null
  private container: AbstractContainer
  private handlers: Map<Symbol, AbstractHandler> = new Map()
  private constructor(module: T) {
    if (!module) {
      throw new TypeError('injected module is nullable')
    }
    setTimeout(() => {
      this.collected = this.resolve(module)
      this.collectDependency(this.collected)
      this.container = this.serviceProviderFactory!.getBuilder().build()
    })
  }

  public useActionHandler(...handlers: AbstractHandler[]) {
    const fn = () => {
      handlers.forEach((r) => {
        if (!this.handlers.has(r.__flag)) {
          this.handlers.set(r.__flag, r)
        }
      })
    }
    this.useFunctionStack.push({
      urgency: Urgency.LowestPriority,
      invoke: fn
    })
    return this
  }

  public useModuleResolver(
    moduleResolver: MaybeNull<BaseModuleResolver> = null
  ) {
    const fn = () => {
      if (!moduleResolver) {
        moduleResolver = new BaseModuleResolver()
      }
      this.moduleResolver = moduleResolver
    }
    this.useFunctionStack.push({
      urgency: Urgency.Preference,
      invoke: fn
    })

    return this
  }

  public useControllerResolver(
    controllerResolver: MaybeNull<BaseControllerResolver> = null
  ) {
    const fn = () => {
      if (!this.moduleResolver) {
        throw new TypeError('injected module is nullable')
      }
      if (!controllerResolver) {
        controllerResolver = new BaseControllerResolver()
      }
      this.controllerResolver = controllerResolver
      this.moduleResolver.useControllerResolver(controllerResolver)
    }
    this.useFunctionStack.push({
      urgency: Urgency.General,
      invoke: fn
    })

    return this
  }

  public useServiceProviderFactory(
    serviceProviderFactory: AbstractServiceProviderFactory
  ) {
    const fn = () => {
      this.serviceProviderFactory = serviceProviderFactory
    }
    this.useFunctionStack.push({
      urgency: Urgency.LowestPriority,
      invoke: fn
    })

    return this
  }

  public useParameterResolver(parameterResolver: AbstractParameterResolver) {
    const fn = () => {
      if (!this.moduleResolver) {
        throw new Error('module resolver is not defined')
      }
      const controllerResolver = this.moduleResolver.getControllerResolver()
      if (!controllerResolver) {
        throw new Error('controller resolver is not defined')
      }
      controllerResolver.useParameterResolvers(parameterResolver)
    }

    this.useFunctionStack.push({
      urgency: Urgency.LowestPriority,
      invoke: fn
    })

    return this
  }

  public async listen(port: number) {
    http
      .createServer(async (req, res) => {
        const { isMatched, collectedInfo } = this.isMatch(req)
        res.on('finish', () => {
          this.container.dispose()
        })

        if (isMatched) {
          try {
            await this.handleRequest(req, res, collectedInfo!)
            return
          } catch (err) {
            this.handleError(err, res, collectedInfo!)
            return
          }
        } else {
          return res.end('not found')
        }
      })
      .listen(port)
  }
  private handleError(
    err: unknown,
    res: ServerResponse,
    collectedInfo: ICollected
  ) {
    const errorCapturedHandler = this.handlers.get(ErrorCapturedHandlerName) as
      | AbstractErrorHandler
      | undefined
    if (errorCapturedHandler) {
      errorCapturedHandler.handle(res, err)
    } else {
      let errResult: ErrorResult
      if (err instanceof Error) {
        const error = err as Error
        errResult = new ErrorResult(error, collectedInfo!)
      } else {
        errResult = new ErrorResult(
          new Error(JSON.stringify(err)),
          collectedInfo!
        )
      }
      res.setHeader('Content-Type', 'application/json')
      res.end(errResult.toString())
    }
  }

  public static create(module: Function) {
    if (!Server.instance) {
      Server.instance = new Server(module)
    }
    return Server.instance
  }

  private collectDependency(collected: ICollected[]) {
    const builder = this.serviceProviderFactory!.getBuilder()
    for (let i = 0; i < collected.length; i++) {
      const collectedItem = collected[i]
      this.regsiterDependencies(builder, collectedItem)
    }
  }

  private regsiterDependencies(
    builder: AbstractContainerBuilder,
    collectedItem: ICollected
  ) {
    collectedItem.dependencies.forEach((r) => {
      builder.register(r.constructor.name, r)
    })
  }

  private resolve(module: Function) {
    if (!this.moduleResolver) {
      this.useModuleResolver()
    }
    if (!this.controllerResolver) {
      this.useControllerResolver()
    }

    // 开始执行优先级高的任务
    const sortedInvokeStack = [...this.useFunctionStack].sort(
      (a, b) => b.urgency - a.urgency
    )

    sortedInvokeStack.forEach((r) => {
      r.invoke()
    })

    return this.moduleResolver!.resolve(module)
  }

  private isMatch(req: IncomingMessage) {
    const { pathname } = parseUrl(req.url!)
    const matchedInfo = this.isMatchParam(pathname!)

    // 如果路由匹配到了，并且collectedInfo的请求方法和req的请求方法一样，则表示匹配通过
    if (
      matchedInfo.isMatched &&
      matchedInfo.collectedInfo!.requestMethod.toLowerCase() ===
        req.method!.toLowerCase()
    ) {
      return matchedInfo
    } else {
      // 如果请求方法不一样，但是匹配到了说明请求方法不一样，表示匹配失败
      return {
        isMatched: false,
        collectedInfo: null
      }
    }
  }

  private isMatchParam(pathname: string) {
    // pathname: /user/1
    // 从collected找到能匹配到的最小层级的param路由

    const realPathNameParams = pathname.split('/').filter((r) => r)

    if (realPathNameParams.length === 0) {
      return {
        isMatched: false,
        collectedInfo: null
      }
    }
    let restCollected = [...this.collected]

    let minLevelCollected: ICollected[] = [...restCollected]

    let index = 1
    while (restCollected.length !== 0) {
      const _params = '/' + realPathNameParams.slice(0, index++).join('/')
      restCollected = this.collected.filter((r) => r.path.startsWith(_params))
      if (_params === pathname) {
        const collectedInfo = this.collected.find((r) =>
          r.path.startsWith(_params)
        )
        return {
          isMatched: !!collectedInfo === true,
          collectedInfo: collectedInfo
        }
      }
      if (restCollected.length > 0) {
        minLevelCollected = restCollected
      }
    }

    // 最小层级的长度为0，匹配失败
    if (minLevelCollected.length === 0) {
      return {
        isMatched: false,
        collectedInfo: null
      }
    }

    for (let i = 0; i < minLevelCollected.length; i++) {
      const info = minLevelCollected[i]

      const { path: presetPathname } = info

      // 开始对比
      const presetPathNameParams = presetPathname.split('/').filter((r) => r)

      const _realPathNameParams = [...realPathNameParams]

      const isMatched = this.matchParam(
        presetPathNameParams,
        _realPathNameParams
      )

      if (isMatched) {
        return {
          isMatched,
          collectedInfo: info
        }
      }
    }

    return {
      isMatched: false,
      collectedInfo: null
    }
  }

  private matchParam(
    presetPathNameParams: string[],
    realPathNameParams: string[]
  ) {
    while (presetPathNameParams.length > 0) {
      const presetPathNameParam = presetPathNameParams.shift()?.toLowerCase()
      const realPathNameParam = realPathNameParams.shift()?.toLowerCase()

      if (!presetPathNameParam) {
        return realPathNameParams.length === 0
      }
      // 预设的parameter以':'开头，则判断realPathNameParam有无，没有表示不匹配
      if (presetPathNameParam.startsWith(':') && !realPathNameParam) {
        return false
      } else if (!presetPathNameParam.startsWith(':')) {
        // 预设的parameter没有以':'开头，则判断realPathNameParam和presetPathNameParam是否相等
        if (presetPathNameParam !== realPathNameParam) {
          return false
        }
      }
    }
    if (presetPathNameParams.length === 0 && realPathNameParams.length === 0) {
      return true
    }

    return false
  }

  private async invokeMiddleware(req: http.IncomingMessage, info: ICollected) {
    if (info.middlewares.length) {
      const next = async () => {
        const middleware = info.middlewares.shift()
        if (middleware) {
          const middlewareInstance = this.container.resolve(
            middleware.name
          ) as AbstractMiddleware
          try {
            const result = await Promise.resolve(
              middlewareInstance.use(req, next)
            )
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
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    info: ICollected
  ) {
    const instance: BaseController = this.container.resolve(
      info.requestController.name
    )

    if (!info.anonymous) {
      const result = await this.handleAuthorize(req, res)
      if (!result) {
        return
      }
    }

    // 处理参数
    const parameters = await this.getInjectedParameter(req, info, instance)
    if (!Array.isArray(parameters) && !parameters.valid) {
      this.handleParameterInValidate(res, info, parameters)
      return
    }

    await this.invokeMiddleware(req, info)
    let result: unknown

    try {
      result = await Promise.resolve(
        info.requestHandler.apply(
          instance,
          (parameters as ResolvedParameter[]).map((r) => {
            return r.parameterValue
          })
        )
      )
    } catch (err) {
      this.handleError(err, res, info)
      return
    }

    if (!(result instanceof ControllerResult)) {
      throw new Error(
        `${info.requestHandler.name} return value is not instanceof ${ControllerResult.name}`
      )
    }

    res.statusCode = result.statusCode
    const headers = instance.getResponseHeaders()
    const headerObj: Record<string, string> = {}
    headers.forEach((value: string, key: string) => {
      headerObj[key] = value
    })
    res.writeHead(result.statusCode, headerObj)
    res.end(result.data)
  }
  private async handleAuthorize(req: IncomingMessage, res: ServerResponse) {
    const authorizeHandler = this.handlers.get(AuthorizeHandlerName) as
      | AbstractAuthorizeHandler
      | undefined
    if (authorizeHandler) {
      return await authorizeHandler.handle(res, req)
    } else {
      throw new Error('no handler AuthorizeHandler implemented or used')
    }
  }
  private handleParameterInValidate(
    res: ServerResponse,
    info: ICollected,
    valiadteResult: ValidateResult
  ) {
    const parameterInValidateHandler = this.handlers.get(
      ParameterInvalidateHandlerName
    ) as AbstractParameterInValidateHandler | undefined
    if (parameterInValidateHandler) {
      parameterInValidateHandler.handle(res, valiadteResult.errorMessage)
    } else {
      res.setHeader('Content-Type', 'application/json')
      const result = new ParameterInValidateResult(
        info,
        valiadteResult.errorMessage
      )
      res.end(result.toString())
    }
  }

  private async getInjectedParameter(
    req: http.IncomingMessage,
    info: ICollected,
    controllerInstance: BaseController
  ): Promise<ResolvedParameter[] | ValidateResult> {
    const resultParameters: ResolvedParameter[] = []
    const parameters = info.requestHandlerParameters

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i]
      const parameterResolver = this.controllerResolver!.get(
        parameter.paramFrom
      )

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

        // 参数验证入口
        const result = this.validateParameter(
          parameterObject.parameterValue,
          controllerInstance,
          info,
          parameter
        )
        if (!result.valid) {
          return result
        }

        resultParameters.push(parameterObject)
      }
    }

    resultParameters.sort((a, b) => a.parameterIndex - b.parameterIndex)

    return resultParameters
  }

  private validateParameter(
    object: unknown,
    controllerInstance: BaseController,
    info: ICollected,
    parameter: Parameter
  ): ValidateResult {
    // 对象的情况
    if (typeof object === 'object' && !Array.isArray(object)) {
      return this.validateObjectParameter(
        object as Record<string, unknown>,
        controllerInstance,
        info,
        parameter
      )
    } else {
      return this.validatePrimativeParameter(
        object,
        controllerInstance,
        info,
        parameter
      )
    }
  }

  private validatePrimativeParameter(
    object: unknown,
    controllerInstance: BaseController,
    info: ICollected,
    parameter: Parameter
  ) {
    const metadataNameValue = Reflect.getMetadata(
      ValidateMetadataName,
      controllerInstance,
      `${info.requestHandler.name}.${parameter.index}`
    ) as string[] | undefined
    if (!metadataNameValue || metadataNameValue.length === 0) {
      return {
        valid: true,
        errorMessage: ''
      }
    }

    const validationFilters = metadataNameValue
      .map((r) => `${info.requestHandler.name}.${parameter.index}.${r}`)
      .map((r) => {
        return Reflect.getMetadata(
          ValidateMetadataKey,
          controllerInstance,
          r
        ) as AbstractValidationFilter | undefined
      })
      .filter((r) => r !== undefined) as AbstractValidationFilter[]
    const inValidValidationResult = validationFilters
      .map((r) => {
        return {
          valid: r.validate(object),
          errorMessage: r.errorMessage
        }
      })
      .find((r) => !r.valid)
    return (
      inValidValidationResult || {
        valid: true,
        errorMessage: ''
      }
    )
  }

  private validateObjectParameter(
    object: Record<string, unknown>,
    controllerInstance: BaseController,
    info: ICollected,
    parameter: Parameter
  ): ValidateResult {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const metadataNameValue = Reflect.getMetadata(
          ValidateMetadataName,
          object,
          key
        ) as string[] | undefined

        if (!metadataNameValue || metadataNameValue.length === 0) {
          continue
        }

        const validationFilters = metadataNameValue
          .map((r) => `${key}.${r}`)
          .map((r) => {
            return Reflect.getMetadata(ValidateMetadataKey, object, r) as
              | AbstractValidationFilter
              | undefined
          })
          .filter((r) => r !== undefined) as AbstractValidationFilter[]

        const inValidValidationResult = validationFilters
          .map((r) => {
            return {
              valid: r.validate(object[key]),
              errorMessage: r.errorMessage
            }
          })
          .find((r) => !r.valid)
        if (!inValidValidationResult) {
          continue
        }

        return inValidValidationResult
      }
    }
    return {
      valid: true,
      errorMessage: ''
    }
  }
}
