import {
  Body,
  Controller,
  File,
  Get,
  Header,
  Param,
  Post,
  Query
} from '../src/core/request/decorator'
import { promises } from 'fs'
import { FileParameterData } from '../src/core/setup'

@Controller('/user')
export class UserController {
  @Post('/list')
  async userList(@File('file') fileContent: FileParameterData) {
    console.log(fileContent.fileInfo)
    await promises.writeFile('./test.txt', fileContent.fileData)
    return {
      success: true,
      code: 10000,
      data: {
        ss: '成功'
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
