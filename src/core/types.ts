export interface ManagedRoute {
  path: string;
  method: string;
  callee: Function;
  constructor: Function;
  controller: string;
}

export interface ManagedController {
  prefix: string;
  constructor: Function;
  controller: string;
}

export interface ManagedModule {
  moduleName: string;
  controllers: Array<Function>;
}

export interface ManagedQueries {
  controller: string;
  methodName: string;
  parseName: string;
  paramIndex: number;
  paramFrom: ParamFromTypes;
}

export interface CorsOptions {
  method?: string;
  headers?: string;
  origin?: string;
  credentials?: boolean;
  maxage?: number;
}

export interface ManagedCors {
  policy?: CorsOptions;
  controller: string;
  methodName: string;
  scope: CorsScope;
}

export enum CorsScope {
  method = 1,
  controller = 2,
}

export enum HttpMethod {
  Get = "get",
  Post = "post",
  Option = "Option",
  Delete = "Delete",
  Put = "Put",
  Patch = "Patch",
  Head = "Head",
}

export enum ParamFromTypes {
  Header = 0,
  Query = 1,
  Params = 2,
  Body = 3,
}

export interface ModuleOptions {
  controllers?: Array<Function>;
  name?: string;
}
