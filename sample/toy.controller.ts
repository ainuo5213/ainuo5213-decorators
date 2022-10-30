import { BaseController } from '@ainuo5213/core'
import { InjectClassMiddleware } from '@ainuo5213/core'
import { Controller } from '@ainuo5213/core'
import { ControllerCorsMiddleware } from './CorsMiddleware'
import { ToyService } from './toy.service'
import { UserDTO } from './UserDTO'
import { Post } from '../packages/route/post'
import { Body } from '@ainuo5213/parameter'
import { MethodAnonymous, MethodAuthorize } from '@ainuo5213/core/authorize'

@InjectClassMiddleware(ControllerCorsMiddleware)
@Controller('/toy')
export class ToyController extends BaseController {
  constructor(private toyService: ToyService) {
    super()
  }
  @Post('/list')
  @MethodAuthorize()
  async userList(@Body() userDTO: UserDTO) {
    const result = this.toyService.getObj()
    // const result = await promises.readFile(path.join(__dirname, './test.jpg'))
    return result
  }
}
