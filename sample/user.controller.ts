import { Controller, Get, Post } from '../src/core/request/decorator'

@Controller('/user')
export class UserController {
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