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
