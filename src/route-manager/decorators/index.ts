import manager from "../index";
import { ManagedRoute, HttpMethod } from "../types";
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

export function Params(param?: string) {
  return (target: Object, methodName: string, descriptor) => {
    manager.registerParam({
      controller: target.constructor.name,
      methodName: methodName,
      parseName: param,
    });
  };
}
