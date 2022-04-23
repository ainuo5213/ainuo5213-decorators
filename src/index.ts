import Koa from "koa";
import Router from "./route-manager/Router";
import bodyParser from "koa-bodyparser";
import {
  Get,
  Prefix,
  Query,
  Header,
  Body,
  Params,
} from "./route-manager/decorators/index";
const koa = new Koa();
const router = new Router();
koa.use(bodyParser());

class UserControler {
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
      id
    };
  }
}

koa.use(router.routes());
koa.use(router.allowedMethods());
router.registerRoute();

koa.listen(3000);
