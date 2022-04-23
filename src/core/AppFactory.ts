import { ManagedRoute, ParamFromTypes, RouteType } from "./types";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import KoaRouter from "koa-router";
import manager, { __GLOBAL__ } from "./manager";
import Application from "koa";
import { readFile } from "fs/promises";
import { join } from "path";

type Constructor<T> = new (...args: any[]) => T;
const CorsPolicies = {
  method: "Access-Control-Allow-Methods",
  headers: "Access-Control-Allow-Headers",
  origin: "Access-Control-Allow-Origin",
  credentials: "Access-Control-Allow-Credentials",
  maxage: "Access-Control-Max-Age",
};

export default class AppFactory {
  public static create<T>(Module: Constructor<T>) {
    let module = new Module() as any;
    const koa = new Koa();
    const router = new KoaRouter();
    Object.setPrototypeOf(module, koa);
    koa.use(bodyParser());
    koa.use(router.routes());
    koa.use(router.allowedMethods());
    manager.flushJob();
    const routes = manager.getManagedRoutes();
    routes.forEach((route: ManagedRoute) => {
      const prefix = manager.getManagedController(route.controller);
      let requestPath = route.path;
      if (prefix) {
        if (!requestPath.startsWith("/")) {
          requestPath = `${
            prefix.prefix === "" ? "" : `/${prefix.prefix}`
          }/${requestPath}
          `;
        }
      }
      router[route.method](
        requestPath,
        async (
          ctx: Application.ParameterizedContext<
            any,
            KoaRouter.IRouterParamContext<any, {}>,
            any
          >
        ) => {
          const managedParams = manager.getManagedParam(
            route.controller,
            route.callee.name
          );
          const instance = new (route.constructor as Constructor<T>)();
          let args = [];
          if (managedParams) {
            managedParams.forEach((managedParam) => {
              let paramIndex = managedParam.paramIndex;
              switch (managedParam.paramFrom) {
                case ParamFromTypes.Body:
                  args[paramIndex] = ctx.request.body[managedParam.parseName];
                  break;

                case ParamFromTypes.Header:
                  args[paramIndex] = ctx.headers[managedParam.parseName];
                  break;

                case ParamFromTypes.Params:
                  args[paramIndex] = ctx.params[managedParam.parseName];
                  break;

                case ParamFromTypes.Query:
                  args[paramIndex] = ctx.query[managedParam.parseName];
                  break;
              }
            });
          }

          // cors policy
          const controllerPolicy = manager.getControllerCorsPolicy(
            route.controller
          );
          const methodPolicy = manager.getMethodCorsPolicy(
            route.controller,
            route.callee.name
          );
          if (methodPolicy) {
            Object.keys(methodPolicy.policy).forEach((key) => {
              const corsKey = CorsPolicies[key];
              ctx.res.setHeader(corsKey, methodPolicy.policy[key]);
            });
          } else if (controllerPolicy) {
            Object.keys(controllerPolicy.policy).forEach((key) => {
              const corsKey = CorsPolicies[key];
              ctx.res.setHeader(corsKey, controllerPolicy.policy[key]);
            });
          }

          if (route.routeType === RouteType.static) {
            const filename = ctx.params["filename"];
            let fileContent = "";
            if (filename) {
              ctx.res.setHeader(CorsPolicies.origin, "*");
              ctx.res.setHeader(CorsPolicies.headers, "*");
              ctx.res.setHeader(CorsPolicies.maxage, 3600);
              ctx.res.setHeader(CorsPolicies.method, "get");
              ctx.res.setHeader(CorsPolicies.credentials, "false");
              fileContent = await readFile(
                join(route.staticFilePath, filename),
                { encoding: route.encoding }
              );
            } else {
              fileContent = await readFile(
                join(process.cwd(), "src", route.path),
                { encoding: route.encoding }
              );
            }
            ctx.body = fileContent;
          } else {
            const result = instance[route.callee.name](...args);
            ctx.body = await Promise.resolve(result);
          }
        }
      );
    });
    return module as Koa;
  }
}
