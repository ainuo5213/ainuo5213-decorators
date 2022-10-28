import { Lifecycle } from '../src/core/dependency-injection/types'
import { Inject } from '../src/core/dependency-injection/inject'
import { UserDao } from './user.dao'
import { Autowired } from '../src/core/dependency-injection/autowired'

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
