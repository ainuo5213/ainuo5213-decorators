/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-16 09:31:33
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 08:27:54
 * @FilePath: \ainuo5213-decorators\src\packages\module\index.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { AppModule } from '../../core/module'
import { ModuleMetadataKey, ModuleOption } from '../../core/types'

export const Module = (option: ModuleOption): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof AppModule)) {
      throw new TypeError(target.name + ' not instance of ' + AppModule.name)
    }

    Reflect.defineMetadata(ModuleMetadataKey, option, target)
  }
}
