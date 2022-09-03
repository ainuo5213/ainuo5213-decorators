import UserModule from './user.module'
import ToyModule from './toy.module'
import { Module, ModuleCors } from '../src/core/request/decorator'

@Module({
  modules: [UserModule]
})
@ModuleCors({
  origin: '*'
})
export default class IndexModule {}
