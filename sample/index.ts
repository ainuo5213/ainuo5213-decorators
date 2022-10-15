/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-15 17:01:04
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-15 20:12:11
 * @FilePath: \ainuo5213-decorators\sample\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { HeaderParameterResolver } from './../src/packages/param/header'
import Server from '../src/core/setup'
import { QueryParameterResolver } from '../src/packages/param/query'
import IndexModule from './index.module'
import { BodyParameterResolver } from '../src/packages/param/body'

async function bootstrap() {
  const app = Server.create(IndexModule)
  await app
    .use(new QueryParameterResolver())
    .use(new HeaderParameterResolver())
    .use(new BodyParameterResolver())
    .listen(3000)
  console.log('当前服务运行在3000')
}
bootstrap()
