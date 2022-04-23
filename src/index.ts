import AppFactory from "./core/AppFactory"
import { User1Module } from "./appModule";
const app = AppFactory.create(User1Module)
app.listen(3000);
