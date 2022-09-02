import { Module } from '../src/core/request/decorator'
import { ToyController } from './toy.controller'

@Module({
  controllers: [ToyController]
})
export default class ToyModule {}
