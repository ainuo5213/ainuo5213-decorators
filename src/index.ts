import Koa from "koa";
import Router from "./route-manager/Router";
import bodyParser from "koa-bodyparser";
import './appModule'
const koa = new Koa();
const router = new Router();
koa.use(bodyParser());

koa.use(router.routes());
koa.use(router.allowedMethods());
router.registerRoute();

koa.listen(3000);
