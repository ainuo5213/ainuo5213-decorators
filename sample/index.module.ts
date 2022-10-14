import UserModule from './user.module'
import ToyModule from './toy.module'
import { Middleware, Module } from '../src/core/request/decorator'
import CorsMiddleware from './CorsMiddleware'

@Middleware(CorsMiddleware)
@Module({})
export default class IndexModule {}
