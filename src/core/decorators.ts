import manager from "./manager";
import {
  ManagedRoute,
  HttpMethod,
  ParamFromTypes,
  ModuleOptions,
  CorsOptions,
  CorsScope,
} from "./types";
function createManageRoute(
  path: string,
  target: any,
  methodName: string,
  method: HttpMethod
) {
  const route: ManagedRoute = {
    method: method,
    constructor: target.constructor,
    controller: target.constructor.name,
    callee: target[methodName],
    path: path || methodName,
  };
  return route;
}
export function Post(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Post)
    );
  };
}

export function Get(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Get)
    );
  };
}

export function Put(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Put)
    );
  };
}

export function Head(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Head)
    );
  };
}

export function Option(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Option)
    );
  };
}

export function Patch(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Patch)
    );
  };
}

export function Delete(path?: string) {
  return (target: Object, methodName: string) => {
    manager.registerRoute(
      createManageRoute(path, target, methodName, HttpMethod.Delete)
    );
  };
}

export function Cors(
  options: CorsOptions = {
    origin: "*",
    method: "*",
    headers: "*",
    credentials: false,
    maxage: 3600,
  }
) {
  return (target: Object | Function, methodName?: string) => {
    const scope =
      typeof target === "function" ? CorsScope.controller : CorsScope.method;
    manager.registerCorsPolicy({
      policy: options,
      methodName: scope === CorsScope.method ? methodName : "",
      controller:
        scope === CorsScope.method
          ? (target as Object).constructor.name
          : (target as Function).name,
      scope,
    });
  };
}

export function Controller(prefix?: string) {
  if (prefix.startsWith("/")) {
    throw new Error("前缀不能以/开头");
  }
  return (target: Function) => {
    manager.registerController({
      prefix: prefix || "",
      constructor: target,
      controller: target.name,
    });
  };
}

function createManagedParam(
  target: Object,
  methodName: string,
  paramName: string,
  index: number,
  paramFrom: ParamFromTypes
) {
  return {
    controller: target.constructor.name,
    methodName: methodName,
    parseName: paramName,
    paramIndex: index,
    paramFrom: paramFrom,
  };
}

export function Query(param?: string) {
  return (target: Object, methodName: string, index: number) => {
    manager.registerParam(
      createManagedParam(target, methodName, param, index, ParamFromTypes.Query)
    );
  };
}

export function Header(param?: string) {
  return (target: Object, methodName: string, index: number) => {
    manager.registerParam(
      createManagedParam(
        target,
        methodName,
        param.toLowerCase(),
        index,
        ParamFromTypes.Header
      )
    );
  };
}

export function Body(param?: string) {
  return (target: Object, methodName: string, index: number) => {
    manager.registerParam(
      createManagedParam(target, methodName, param, index, ParamFromTypes.Body)
    );
  };
}

export function Params(param?: string) {
  return (target: Object, methodName: string, index: number) => {
    manager.registerParam(
      createManagedParam(
        target,
        methodName,
        param,
        index,
        ParamFromTypes.Params
      )
    );
  };
}

export function Module(options?: ModuleOptions) {
  return (target: Function) => {
    if (!options) {
      return;
    }
    manager.registerModule({
      moduleName: options.name || target.name,
      controllers: [...new Set(options.controllers)],
    });
  };
}
