/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-22 09:31:46
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

@Controller('/toy')
export class ToyController extends BaseController {
  constructor(private toyService: ToyService) {
    super()
  }
  @Post('/list')
  async userList(@Body() userDTO: UserDTO) {
    const result = this.toyService.getObj()

    // console.log(this.toyService!.getObj())
    return {
      // id,
      result,
      userDTO
      // success: true,
      // code: 10000,
      // id,
      // data: [
      //   {
      //     name: 'ainuo5213',
      //     age: 18
      //   },
      //   {
      //     name: '孙永刚',
      //     age: 24
      //   }
      // ]
    }
  }
}
