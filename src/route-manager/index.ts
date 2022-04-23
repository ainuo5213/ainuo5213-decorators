import { ManagedRoute, ManagedPrefix, ManagedQueries } from "./types";
class RouteManager {
  private _managedRoutes = new Map<string, ManagedRoute>();
  private _managedPrefixs = new Map<string, ManagedPrefix>();
  private _managedQueries = new Map<string, Array<ManagedQueries>>();
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
    manager._managedRoutes.set(key, route);
  }
  public registerPrefix(prefix: ManagedPrefix) {
    manager._managedPrefixs.set(prefix.controller, prefix);
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
  public getManagedParam(controller: string, callMethodName: string) {
    const key = `${controller}-${callMethodName.toLowerCase()}`;
    return manager._managedQueries.get(key);
  }
  public getManagedPrefix(controller: string) {
    return manager._managedPrefixs.get(controller);
  }
  public getManagedPrefixs() {
    return manager._managedPrefixs;
  }
  public getManagedRoutes() {
    return manager._managedRoutes;
  }
}

const manager = RouteManager.getInstance();

export default manager;
