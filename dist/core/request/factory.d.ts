import { Method, Parameter, CorsPolicy } from './decorator';
declare type AsyncFunc = (...args: any[]) => Promise<any>;
export interface ICollected {
    path: string;
    requestMethod: Method;
    requestHandler: AsyncFunc;
    corsPolicy: CorsPolicy;
    requestHandlerParameters: Parameter[];
}
export declare const moduleFactory: <T extends Function>(moduleClass: T, corsPolicy?: CorsPolicy | undefined) => ICollected[];
export {};
