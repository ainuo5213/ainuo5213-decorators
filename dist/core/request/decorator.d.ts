import 'reflect-metadata';
declare type UppercaseMethod = 'GET' | 'POST' | 'OPTION' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
export declare type Method = UppercaseMethod | Lowercase<UppercaseMethod>;
export declare enum METADATA_KEY {
    METHOD = "ioc:method",
    PATH = "ioc:path",
    MIDDLEWARE = "ioc:middleware",
    MODULE = "ioc:module",
    PARAM = "ioc:param",
    QUERY = "ioc:query",
    BODY = "ioc:body",
    HEADER = "ioc:header",
    File = "ioc:file",
    Files = "ioc:files",
    Cors = "ioc:cros"
}
declare type ParameterType = string | symbol;
export declare const Controller: (path?: string | undefined) => ClassDecorator;
export declare type ModuleOption = Partial<{
    controllers: Function[];
    modules: Function[];
}>;
export declare const Module: (option: ModuleOption) => ClassDecorator;
export declare type ParameterFromType = 'query' | 'param' | 'body' | 'header' | 'file' | 'files';
export declare type Parameter = {
    index: number;
    injectParameterKey: string | symbol;
    paramFrom: ParameterFromType;
};
export declare const Param: (parameterName: ParameterType) => ParameterDecorator;
export declare const Query: (parameterName: ParameterType) => ParameterDecorator;
export declare const Body: () => ParameterDecorator;
export declare const Header: (parameterName: ParameterType) => ParameterDecorator;
export declare const File: (parameterName: ParameterType) => ParameterDecorator;
export declare const Files: () => ParameterDecorator;
export declare const Get: (path: string) => MethodDecorator;
export declare const Post: (path: string) => MethodDecorator;
export declare const Option: (path: string) => MethodDecorator;
export declare const Put: (path: string) => MethodDecorator;
export declare const Patch: (path: string) => MethodDecorator;
export declare const Delete: (path: string) => MethodDecorator;
export declare const Head: (path: string) => MethodDecorator;
export declare type CorsPolicy = {
    origin?: string;
    credentials?: boolean;
    headers?: string;
    methods?: string;
};
export declare const MethodCors: (policy?: CorsPolicy | undefined) => MethodDecorator;
export declare const ControllerCors: (policy?: CorsPolicy | undefined) => ClassDecorator;
export declare const ModuleCors: (policy?: CorsPolicy | undefined) => ClassDecorator;
export {};
