/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 07:19:13
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-25 22:03:35
 * @FilePath: \ainuo5213-decorators\sample\toy.service.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { Lifecycle } from '../src/core/dependency-injection/types'
import { Inject } from '../src/core/dependency-injection/inject'
import { ToyDao } from './toy.dao'
import { Autowired } from '../src/core/dependency-injection/autowired'

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
