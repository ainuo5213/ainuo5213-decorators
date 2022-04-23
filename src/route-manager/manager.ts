import {
  ManagedRoute,
  ManagedController,
  ManagedQueries,
  ManagedModule,
} from "./types";
class RouteManager {
  private _managedRoutes = new Map<string, ManagedRoute>();
  private _ManagedControllers = new Map<string, ManagedController>();
  private _managedQueries = new Map<string, Array<ManagedQueries>>();
  private _ManagedModules = new Map<string, ManagedModule>();
  private static _instance: RouteManager;
  private constructor() {}

  public static getInstance() {
    if (!RouteManager._instance) {
      RouteManager._instance = new RouteManager();
    }

    return RouteManager._instance;
  }
  public registerRoute(route: ManagedRoute) {
    const key = `${route.path}-${route.method.toLowerCase()}`;
    this._managedRoutes.set(key, route);
  }
  public registerController(controller: ManagedController) {
    this._ManagedControllers.set(controller.controller, controller);
  }
  public registerModule(module: ManagedModule) {
    if (!this._ManagedModules.has(module.moduleName)) {
      this._ManagedModules.set(module.moduleName, module);
    }
  }
  public registerParam(query: ManagedQueries) {
    const key = `${query.controller}-${query.methodName.toLowerCase()}`;
    let arraylist = this._managedQueries.get(key);
    if (!arraylist) {
      arraylist = [];
      this._managedQueries.set(key, arraylist);
    }
    arraylist.push(query);
  }
  public getManageModule(moduleName: string) {
    this._ManagedModules.get(moduleName);
  }
  public getManagedParam(controller: string, callMethodName: string) {
    const key = `${controller}-${callMethodName.toLowerCase()}`;
    return manager._managedQueries.get(key);
  }
  public getManagedController(controller: string) {
    return this._ManagedControllers.get(controller);
  }
  public getManagedControllers() {
    return this._ManagedControllers;
  }
  public getManagedRoutes() {
    return this._managedRoutes;
  }
  private dependencyInjected(controller: string) {
    let has = false;
    this._ManagedModules.forEach(({controllers}) => {
      if (controllers.findIndex((r) => r.name === controller) === -1) {
        has = true;
        return;
      }
    })
    return has;
  }
}

const manager = RouteManager.getInstance();

export default manager;
