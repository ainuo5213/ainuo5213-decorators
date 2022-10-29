/*
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 08:37:55
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 20:23:58
 * @FilePath: \ainuo5213-decorators\sample\UserDTO.ts
 * @Description:
 *
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved.
 */
import { ApiProperty } from '../src/core/parameter'
import { PropMaxCount } from '../src/packages/validate/max-count'
import { PropRange } from '../src/packages/validate/range'

export class UserDTO {
  @PropRange(1, 5, 'id范围再1到5')
  @ApiProperty()
  id: string
}
