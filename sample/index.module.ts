import { AppModule, Module } from '@ainuo5213/core'
import { ClassAuthorize } from '@ainuo5213/core/authorize'
import { ToyController } from './toy.controller'

@Module({
  controllers: [ToyController]
})
export default class IndexModule extends AppModule {}
