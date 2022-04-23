import {
  Get,
  Controller,
  Query,
  Header,
  Body,
  Params,
} from "../route-manager/decorators";
@Controller("")
export default class UserControler {
  @Get("/user/:id")
  public async getUser(
    @Query("age") age: number,
    @Header("uId") uId: string,
    @Body("user") user: { name: string; age: number },
    @Params("id") id: number
  ) {
    return {
      age,
      uId,
      user,
      id,
    };
  }
}
