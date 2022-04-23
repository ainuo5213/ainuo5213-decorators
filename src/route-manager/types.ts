export interface ManagedRoute {
  path: string;
  method: string;
  callee: Function;
  constructor: Function;
}

export interface ManagedPrefix {
  prefix: string;
  constructor: Function;
  controller: string;
}

export interface ManagedQueries {
  controller: string;
  methodName: string;
  parseName: string;
  paramIndex: number;
  paramFrom: ParamFromTypes;
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
  Body = 3
}
