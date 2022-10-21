/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 10:27:54
 * @FilePath: \ainuo5213-decorators\sample\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { ServiceProviderFactory } from '../src/core/dependency-injection/service-provider-factory'
import Server from '../src/core/setup'
import { BodyParameterResolver } from '../src/packages/parameter/body'
import { HeaderParameterResolver } from '../src/packages/parameter/header'
import { ParamParameterResolver } from '../src/packages/parameter/param'
import { QueryParameterResolver } from '../src/packages/parameter/query'
import IndexModule from './index.module'

async function bootstrap() {
  const app = Server.create(IndexModule)
  await app
    .useServiceProviderFactory(new ServiceProviderFactory())
    .useParameterResolver(new QueryParameterResolver())
    .useParameterResolver(new HeaderParameterResolver())
    .useParameterResolver(new BodyParameterResolver())
    .useParameterResolver(new ParamParameterResolver())
    .listen(3000)
  console.log('当前服务运行在3000')
}
bootstrap()
// import { Lifecycle } from '../src/core/dependency-injection'
// import { ContainerBuilder } from '../src/packages/dependency-injection/container-builder'
// import { ToyService } from './toy.service'

// const app = Server.create(IndexModule)
// const builder = new ContainerBuilder()

// builder.register({
//   option: {
//     lifecycle: Lifecycle.singleton
//   },
//   constructor: ToyService
// })

// const container = builder.build()

// const instance = container.resolve(ToyService)

// console.log(instance)
