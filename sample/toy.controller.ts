import { BaseController } from '@ainuo5213/core'
import { InjectClassMiddleware } from '@ainuo5213/core'
import { Controller } from '@ainuo5213/core'
import { ControllerCorsMiddleware } from './CorsMiddleware'
import { ToyService } from './toy.service'
import { UserDTO } from './UserDTO'
import { Post } from '../packages/route/post'
import { Body, Query } from '@ainuo5213/parameter'
import { MethodAnonymous, MethodAuthorize } from '@ainuo5213/core/authorize'
import { get } from 'http'
import { Get } from '@ainuo5213/route'

@InjectClassMiddleware(ControllerCorsMiddleware)
@Controller('/toy')
export class ToyController extends BaseController {
  constructor(private toyService: ToyService) {
    super()
  }
  @Get('/list')
  @MethodAuthorize()
  async userList(@Query('id') id: string) {
    const result = this.toyService.getObj()
    // const result = await promises.readFile(path.join(__dirname, './test.jpg'))
    return this.success({
      result,
      id
    })
  }
}
