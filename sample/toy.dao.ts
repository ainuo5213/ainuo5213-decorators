import { Lifecycle } from '../src/core/dependency-injection/types'
import { Inject } from '../src/core/dependency-injection/inject'

@Inject({
  lifecycle: Lifecycle.singleton
})
export class ToyDao {
  getObj() {
    return 123
  }
}
