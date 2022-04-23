import { Module } from "../route-manager/decorators";
import UserControler from "./UserController";
import CityController from "./UserController";

@Module({
  controllers: [UserControler],
})
export class User1Module {}

// @Module({
//   controllers: [],
// })
// export class UserModule {}
