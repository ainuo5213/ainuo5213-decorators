/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-16 09:30:45
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 08:26:11
 * @FilePath: \ainuo5213-decorators\src\packages\controller\controller.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { BaseController } from '../../core/controller'
import { PathMetadataKey } from '../../core/types'
export const Controller = (path?: string): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof BaseController)) {
      throw new TypeError(
        target.name + ' not instance of ' + BaseController.name
      )
    }
    Reflect.defineMetadata(PathMetadataKey, path ?? '', target)
  }
}
