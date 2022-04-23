import path from "path";
import { Module, Cors, Static } from "../core/decorators";
import UserControler from "./UserController";

@Module({
  controllers: [UserControler],
})
@Static({
  path: "/static",
  staticPath: path.join(process.cwd(), '/src/static'),
  encoding: "utf-8"
})
export class User1Module {
  constructor() {}
}

// @Module({
//   controllers: [CityController],
// })
// export class UserModule {}
