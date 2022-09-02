import UserModule from './user.module'
import ToyModule from './toy.module'
import { Module } from '../src/core/request/decorator'

@Module({
  modules: [UserModule, ToyModule]
})
export default class IndexModule {}
