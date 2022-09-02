import { Module } from '../src/core/request/decorator'
import { UserController } from './user.controller'

@Module({
  controllers: [UserController]
})
export default class UserModule {}