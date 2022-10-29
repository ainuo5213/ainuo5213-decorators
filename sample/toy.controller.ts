/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 18:16:09
 * @FilePath: \ainuo5213-decorators\sample\toy.controller.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { BaseController } from '../src/core/controller'
import { Controller } from '../src/packages/controller/controller'
import { ModelQuery, Query } from '../src/packages/parameter/query'
import { Get } from '../src/packages/route/get'
import { Post } from '../src/packages/route/post'
import { ToyService } from './toy.service'
import { Body } from '../src/packages/parameter/body'
import { UserDTO } from './UserDTO'
import { Autowired } from '../src/core/dependency-injection/autowired'
import { InjectClassMiddleware } from '../src/packages/middleware'
import { ControllerCorsMiddleware } from './CorsMiddleware'
import { promises } from 'fs'
import path from 'path'

@InjectClassMiddleware(ControllerCorsMiddleware)
@Controller('/toy')
export class ToyController extends BaseController {
  constructor(private toyService: ToyService) {
    super()
  }
  @Post('/list')
  async userList(@Body() userDTO: UserDTO) {
    // const result = this.toyService.getObj()
    throw new Error('xxxx')
    const result = await promises.readFile(path.join(__dirname, './test.jpg'))
    return 'xxxx'
  }
}
