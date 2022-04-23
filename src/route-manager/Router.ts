import { ManagedRoute, ParamFromTypes } from "./types";
import KoaRouter from "koa-router";
import manager from "./manager";
import Application from "koa";

export default class Router extends KoaRouter {
  public registerRoute() {
    manager.flushJob();
    const routes = manager.getManagedRoutes();
    routes.forEach((route: ManagedRoute) => {
      manager.flushJob();
      const prefix = manager.getManagedController(route.controller);
      let requestPath = route.path;
      if (prefix) {
        requestPath = `${prefix.prefix === "" ? "" : `/${prefix.prefix}`}${
          requestPath.startsWith("/") ? requestPath : `/${requestPath}`
        }`;
      }
      this[route.method](
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
          ctx.body = await Promise.resolve(result);
        }
      );
    });
  }
}
