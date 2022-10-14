import { BaseController } from '../src/core/controller'
import {
  Controller,
  Get,
  InjectClassMiddleware,
  InjectMethodMiddleware,
  Post
} from '../src/core/request/decorator'
import { ControllerCorsMiddleware, RouteCorsMiddleware } from './CorsMiddleware'

@InjectClassMiddleware(ControllerCorsMiddleware)
@Controller('/toy')
export class ToyController extends BaseController {
  @InjectMethodMiddleware(RouteCorsMiddleware)
  @Get('/list')
  async userList() {
    return {
      success: true,
      code: 10000,
      data: [
        {
          name: 'ainuo5213',
          age: 18
        },
        {
          name: '孙永刚',
          age: 24
        }
      ]
    }
  }

  @Post('/add')
  async addUser() {
    return {
      success: true,
      code: 10000
    }
  }
}
