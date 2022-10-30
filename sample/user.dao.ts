import { Inject, Lifecycle } from '@ainuo5213/core'

@Inject({
  lifecycle: Lifecycle.scoped
})
export class UserDao {
  getObj() {
    return 234
  }
}
