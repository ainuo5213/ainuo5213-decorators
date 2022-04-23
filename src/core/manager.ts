import path, { join } from "path";
import {
  ManagedRoute,
  ManagedController,
  ManagedQueries,
  ManagedModule,
  ManagedCors,
  DecoratorScope,
  ManagedStatic,
  StaticScope,
  HttpMethod,
  RouteType,
} from "./types";

export const __GLOBAL__ = "__GLOBAL__";

class RouteManager {
  private _managedRoutes = new Map<string, ManagedRoute>();
  private _managedControllers = new Map<string, ManagedController>();
  private _managedQueries = new Map<string, Array<ManagedQueries>>();
  private _managedModules = new Map<string, ManagedModule>();
  private _managedCorses = new Map<string, ManagedCors>();
  private static _instance: RouteManager;
  private _jobQueue: Array<() => void> = [];
  private constructor() {}

  public static getInstance() {
    if (!RouteManager._instance) {
      RouteManager._instance = new RouteManager();
    }

    return RouteManager._instance;
  }
  public registerRoute(route: ManagedRoute) {
    const key = `${route.path}-${route.method.toLowerCase()}`;
    this._jobQueue.push(() => {
      if (this._managedControllers.has(route.controller)) {
        this._managedRoutes.set(key, route);
      }
    });
  }
  public registerController(controller: ManagedController) {
    this._jobQueue.push(() => {
      if (this.dependencyInjected(controller.controller)) {
        this._managedControllers.set(controller.controller, controller);
      }
    });
  }
  public registerModule(module: ManagedModule) {
    if (!this._managedModules.has(module.moduleName)) {
      this._managedModules.set(module.moduleName, module);
    }
  }
  public registerParam(query: ManagedQueries) {
    const key = `${query.controller}-${query.methodName.toLowerCase()}`;
    let arraylist = this._managedQueries.get(key);
    if (!arraylist) {
      arraylist = [];
      this._managedQueries.set(key, arraylist);
    }
    this._jobQueue.push(() => {
      if (this._managedControllers.has(query.controller)) {
        arraylist.push(query);
      }
    });
  }
  public registerCorsPolicy(cors: ManagedCors) {
    const key =
      cors.scope === DecoratorScope.method
        ? `${cors.controller}-${cors.methodName}`
        : cors.controller;
    this._jobQueue.push(() => {
      if (this._managedControllers.has(cors.controller)) {
        this._managedCorses.set(key, cors);
      }
    });
  }
  public registerStatic(staticOption: ManagedStatic) {
    // scope有三种：module、method
    // module表示静态文件夹，全局可访问
    // method表示静态资源，方法级别的
    const key =
      staticOption.scope === StaticScope.method
        ? `${staticOption.controller}-${staticOption.methodName}`
        : __GLOBAL__;
    this._jobQueue.push(() => {
      if (
        staticOption.scope === StaticScope.method &&
        this._managedControllers.has(staticOption.controller)
      ) {
        this._managedRoutes.set(key, {
          path: staticOption.path,
          staticFilePath: staticOption.staticFilePath,
          method: HttpMethod.Get,
          callee: staticOption.callee,
          constructor: staticOption.constructor,
          controller: staticOption.controller,
          routeType: RouteType.static,
          encoding: staticOption.encoding,
        });
      } else {
        this._managedRoutes.set(key, {
          path: `${staticOption.path}${staticOption.path.endsWith("/") ? ":filename" : "/:filename"}`,
          method: HttpMethod.Get,
          callee: staticOption.callee,
          constructor: staticOption.constructor,
          controller: staticOption.controller,
          routeType: RouteType.static,
          encoding: staticOption.encoding,
          staticFilePath: staticOption.staticFilePath
        });
      }
    });
  }
  public getControllerCorsPolicy(controller: string) {
    return this._managedCorses.get(controller);
  }
  public getMethodCorsPolicy(controller: string, methodName: string) {
    return this._managedCorses.get(`${controller}-${methodName}`);
  }
  public getManageModule(moduleName: string) {
    this._managedModules.get(moduleName);
  }
  public getManagedParam(controller: string, callMethodName: string) {
    const key = `${controller}-${callMethodName.toLowerCase()}`;
    return manager._managedQueries.get(key);
  }
  public getManagedController(controller: string) {
    return this._managedControllers.get(controller);
  }
  public getManagedControllers() {
    return this._managedControllers;
  }
  public getManagedRoutes() {
    return this._managedRoutes;
  }
  public getJobQueue() {
    return this._jobQueue;
  }
  public flushJob() {
    this._jobQueue.reverse().forEach((cb) => {
      cb();
    });
    this._jobQueue.length = 0;
  }
  private dependencyInjected(controller: string) {
    let has = false;
    this._managedModules.forEach(({ controllers }) => {
      if (controllers.findIndex((r) => r.name === controller) > -1) {
        has = true;
        return;
      }
    });
    return has;
  }
}

const manager = RouteManager.getInstance();

export default manager;
