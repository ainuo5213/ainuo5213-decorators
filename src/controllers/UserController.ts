import {
  Get,
  Controller,
  Query,
  Header,
  Body,
  Params,
  Cors,
} from "../core/decorators";

@Controller("user")
@Cors({
  method: "*",
  origin: "http://127.0.0.1:5500",
})
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
