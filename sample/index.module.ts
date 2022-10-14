import { InjectClassMiddleware, Module } from '../src/core/request/decorator'
import { ModuleCorsMiddleware } from './CorsMiddleware'
import { AppModule } from '../src/core/module'
import { ToyController } from './toy.controller'

@InjectClassMiddleware([ModuleCorsMiddleware])
@Module({
  controllers: [ToyController]
})
export default class IndexModule extends AppModule {}
