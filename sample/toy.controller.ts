/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 20:56:45
 * @FilePath: \ainuo5213-decorators\sample\toy.controller.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { BaseController } from '../src/core/controller'
import {
  Controller,
  InjectClassMiddleware,
  InjectMethodMiddleware
} from '../src/core/factory/decorator'
import { Post } from '../src/packages/route/post'
import { Query } from '../src/packages/param/query'

import { ControllerCorsMiddleware, RouteCorsMiddleware } from './CorsMiddleware'
import { Body } from '../src/packages/param/body'
import { Param } from '../src/packages/param/param'

@Controller('/toy')
export class ToyController extends BaseController {
  @Post('/list/:id/:male')
  async userList(@Param('id') id: any, @Param('male') male: any) {
    return {
      id,
      male
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
