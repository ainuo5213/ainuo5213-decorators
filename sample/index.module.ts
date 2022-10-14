import UserModule from './user.module'
import ToyModule from './toy.module'
import { Module } from '../src/core/request/decorator'
import CorsMiddleware from './CorsMiddleware'

@Module({
  modules: [UserModule],
  middleware: [CorsMiddleware]
})
export default class IndexModule {}
