/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 19:33:57
 * @FilePath: \ainuo5213-decorators\sample\index.module.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { ModuleCorsMiddleware } from './CorsMiddleware'
import { AppModule } from '../src/core/module'
import { ToyController } from './toy.controller'
import { InjectClassMiddleware, Module } from '../src/core/factory/decorator'

@Module({
  controllers: [ToyController]
})
export default class IndexModule extends AppModule {}
