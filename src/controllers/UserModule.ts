import { Module } from "../route-manager/decorators";
import UserControler from "./UserController";
import "./CityController";

@Module({
  controllers: [UserControler],
})
export class User1Module {
  constructor() {}
}

// @Module({
//   controllers: [CityController],
// })
// export class UserModule {}
