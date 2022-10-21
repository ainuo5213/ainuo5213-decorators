/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 09:48:57
 * @FilePath: \ainuo5213-decorators\src\core\collected\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { BaseController } from '../controller'
import { ServiceValue } from '../dependency-injection/types'
import { MiddlewareType } from '../middleware'
import { AsyncFunc, Parameter } from '../parameter'

export interface ICollected {
  path: string
  requestMethod: string
  requestHandler: AsyncFunc
  requestHandlerParameters: Parameter[]
  middlewares: MiddlewareType[]
  requestController: typeof BaseController
  dependencies: Map<string, ServiceValue>
}
