import Server from '../src/core/setup'
import IndexModule from './index.module'

async function bootstrap() {
  const app = Server.create(IndexModule)
  await app.listen(3000)
  console.log('当前服务运行在3000')
}
bootstrap()
