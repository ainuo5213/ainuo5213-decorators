import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query
} from '../src/core/request/decorator'

@Controller('/user')
export class UserController {
  @Get('/list')
  async userList(@Header('Content-Type') contentType: string) {
    return {
      success: true,
      code: 10000,
      data: {
        contentType
      }
    }
  }

  // @Post('/add')
  // async addUser(@Body() user: { userName: string; age: number }) {
  //   return {
  //     success: true,
  //     code: 10000,
  //     data: user
  //   }
  // }
}
