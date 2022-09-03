import { Method, METADATA_KEY, Parameter, CorsPolicy } from './decorator';
declare type AsyncFunc = (...args: any[]) => Promise<any>;
export interface ICollected {
    path: string;
    requestMethod: Method;
    requestHandler: AsyncFunc;
    corsPolicy: CorsPolicy;
    requestHandlerParameters: Parameter[];
}
export declare const moduleFactory: <T extends Function>(moduleClass: T, corsPolicy?: CorsPolicy | undefined) => ICollected[];
export declare const routerFactory: <T extends Function>(controllerClass: T, moduleCorsPolicy?: CorsPolicy | undefined) => ICollected[];
export declare const corsPolicyFactory: (object: Function, handler: AsyncFunc) => CorsPolicy;
export declare const parameterFactory: (metadataKey: METADATA_KEY) => (object: Function, handler: AsyncFunc) => Parameter[];
export declare const paramFactory: (object: Function, handler: AsyncFunc) => Parameter[];
export declare const queryFactory: (object: Function, handler: AsyncFunc) => Parameter[];
export declare const bodyFactory: (object: Function, handler: AsyncFunc) => Parameter[];
export declare const headerFactory: (object: Function, handler: AsyncFunc) => Parameter[];
export declare const fileFactory: (object: Function, handler: AsyncFunc) => Parameter[];
export declare const filesFactory: (object: Function, handler: AsyncFunc) => Parameter[];
export {};
//# sourceMappingURL=factory.d.ts.map