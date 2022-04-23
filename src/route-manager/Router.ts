import { ManagedRoute } from "./types";
import KoaRouter from "koa-router";
import manager from "./index";
import Application from "koa";

export default class Router extends KoaRouter {
  public registerRoute() {
    const routes = manager.getManagedRoutes();
    routes.forEach((route: ManagedRoute) => {
      const prefix = manager.getManagedPrefix(route.constructor.name);
      let requestPath = route.path;
      if (prefix) {
        requestPath = `/${prefix.prefix}${
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
          const managedParams = manager.getManagedQuery(
            route.constructor.name,
            route.callee.name
          );
          let args = [];
          managedParams.forEach((managedParam) => {
            args.push(ctx.query[managedParam.parseName]);
          });

          const result = route.callee(...args, ctx);
          ctx.body = await Promise.resolve(result);
        }
      );
    });
  }
}
