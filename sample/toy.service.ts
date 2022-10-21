import { Lifecycle } from '../src/core/dependency-injection/types'
import { Inject } from '../src/core/dependency-injection/inject'
import { ToyDao } from './toy.dao'

@Inject({
  lifecycle: Lifecycle.singleton
})
export class ToyService {
  constructor(private toyDao: ToyDao) {}
  getObj() {
    return this.toyDao.getObj()
  }
}
