import { Server, ServiceProviderFactory } from '@ainuo5213/core'
import {
  BodyParameterResolver,
  HeaderParameterResolver,
  ModelQueryParameterResolver,
  ParamParameterResolver,
  QueryParameterResolver
} from '@ainuo5213/parameter'
import { AuthorizeHandler } from './AuthorizeHandler'
import { ErrorHandler } from './ErrorHandler'
import IndexModule from './index.module'

async function bootstrap() {
  const app = Server.create(IndexModule)
  await app
    .useServiceProviderFactory(new ServiceProviderFactory())
    .useParameterResolver(new QueryParameterResolver())
    .useParameterResolver(new HeaderParameterResolver())
    .useParameterResolver(new BodyParameterResolver())
    .useParameterResolver(new ParamParameterResolver())
    .useParameterResolver(new ModelQueryParameterResolver())
    .useActionHandler(new ErrorHandler())
    .listen(3000)
  console.log('当前服务运行在3000')
}
bootstrap()
