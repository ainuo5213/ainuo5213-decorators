import {
  Controller,
  Get,
  Param,
  Post,
  Query
} from '../src/core/request/decorator'

@Controller('/user')
export class UserController {
  @Get('/list/:id')
  async userList(@Param('id') id: number, @Query('name') name: string) {
    return {
      success: true,
      code: 10000,
      data: [
        {
          name: name,
          id: id
        }
      ]
    }
  }

  @Get('/add')
  async addUser(@Query('id') id: string, @Query('name') name: string) {
    return {
      success: true,
      code: 10000,
      data: {
        name,
        id
      }
    }
  }
}
