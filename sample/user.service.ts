import { Autowired, Inject, Lifecycle } from '@ainuo5213/core'
import { UserDao } from './user.dao'

@Inject({
  lifecycle: Lifecycle.scoped
})
export class UserService {
  @Autowired()
  userDao: UserDao
  getObj() {
    return this.userDao.getObj()
  }
}
