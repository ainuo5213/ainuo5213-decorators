import Koa from "koa";
import Router from "./route-manager/Router";
import { Get, Prefix, Params } from "./route-manager/decorators/index";
const koa = new Koa();
const router = new Router();

@Prefix("user")
class UserControler {
  @Get("/user")
  public async getUser(@Params("age") age: number) {
    return {
      age
    }
  }
}

koa.use(router.routes());
koa.use(router.allowedMethods());
router.registerRoute();

koa.listen(3000);
