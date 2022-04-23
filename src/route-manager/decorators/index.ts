import manager from "../index";
import { ManagedRoute, HttpMethod, ParamFromTypes } from "../types";
function createManageRoute(
  path: string,
  target: any,
  methodName: string,
  method: HttpMethod
) {
  const route: ManagedRoute = {
    method: method,
    constructor: target.constructor,
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

export function Prefix(prefix?: string) {
  if (prefix.startsWith("/")) {
    throw new Error("前缀不能以/开头");
  }
  return (target: Function) => {
    manager.registerPrefix({
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
