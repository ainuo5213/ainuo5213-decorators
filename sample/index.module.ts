import { InjectClassMiddleware, Module } from '../src/core/request/decorator'
import { ModuleCorsMiddleware, ModuleCorsMiddleware1 } from './CorsMiddleware'
import { AppModule } from '../src/core/module'
import { ToyController } from './toy.controller'

@InjectClassMiddleware([ModuleCorsMiddleware, ModuleCorsMiddleware1])
@Module({
  controllers: [ToyController]
})
export default class IndexModule extends AppModule {}
