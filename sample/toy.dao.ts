import { Inject, Lifecycle } from '@ainuo5213/core'

@Inject({
  lifecycle: Lifecycle.scoped
})
export class ToyDao {
  getObj() {
    return 123
  }
}
