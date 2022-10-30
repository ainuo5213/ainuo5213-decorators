import { Autowired, Inject, Lifecycle } from '@ainuo5213/core'
import { ToyDao } from './toy.dao'

@Inject({
  lifecycle: Lifecycle.scoped
})
export class ToyService {
  @Autowired()
  toyDao: ToyDao
  getObj() {
    return this.toyDao.getObj()
  }
}
