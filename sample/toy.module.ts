/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-16 10:25:53
 * @FilePath: \ainuo5213-decorators\sample\toy.module.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { AppModule } from '../src/core/module'
import { Module } from '../src/packages/module'
import { ToyController } from './toy.controller'

@Module({
  controllers: [ToyController]
})
export default class ToyModule extends AppModule {}
