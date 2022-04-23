import { ManagedRoute, ParamFromTypes } from "./types";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import KoaRouter from "koa-router";
import manager from "./manager";
import Application from "koa";

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
        requestPath = `${prefix.prefix === "" ? "" : `/${prefix.prefix}`}${
          requestPath.startsWith("/") ? requestPath : `/${requestPath}`
        }`;
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
          let args = [];
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

          const result = route.callee(...args);
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

          ctx.body = await Promise.resolve(result);
        }
      );
    });
    return module as Koa;
  }
}
