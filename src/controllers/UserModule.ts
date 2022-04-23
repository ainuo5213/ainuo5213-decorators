import { Module } from "../core/decorators";
import UserControler from "./UserController";

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
