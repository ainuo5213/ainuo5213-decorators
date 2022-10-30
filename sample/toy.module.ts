import { AppModule, Module } from '@ainuo5213/core'
import { ToyController } from './toy.controller'

@Module({
  controllers: [ToyController]
})
export default class ToyModule extends AppModule {}
