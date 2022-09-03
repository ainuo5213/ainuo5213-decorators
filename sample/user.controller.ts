import {
  Body,
  Controller,
  Files,
  File,
  Get,
  Header,
  Param,
  Post,
  Query
} from '../src/core/request/decorator'
import { promises, createWriteStream } from 'fs'
import { FileParameterData } from '../src/core/setup'

@Controller('/user')
export class UserController {
  @Post('/list')
  async userList(@File('file1') fileContent: FileParameterData) {
    // console.log(fileContent.fileInfo)
    await promises.writeFile(
      fileContent.fileInfo.fileName,
      fileContent.fileData
    )
    // for (const uploadFile of fileContent) {
    //   await promises.writeFile(
    //     uploadFile.fileInfo.fileName,
    //     uploadFile.fileData
    //   )
    //   // uploadFile.fileData.pipe(createWriteStream(uploadFile.fileInfo.fileName))
    // }
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
