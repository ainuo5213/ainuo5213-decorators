"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleFactory = void 0;
const decorator_1 = require("./decorator");
const moduleFactory = (moduleClass, corsPolicy = undefined) => {
    const prototype = moduleClass.prototype;
    const moduleOption = Reflect.getMetadata(decorator_1.METADATA_KEY.MODULE, prototype.constructor);
    const moduleCorsPolicy = Reflect.getMetadata(decorator_1.METADATA_KEY.Cors, prototype.constructor);
    const collectedData = [];
    if (moduleOption?.controllers?.length) {
        moduleOption.controllers.forEach((r) => {
            collectedData.push(...routerFactory(r, moduleCorsPolicy || corsPolicy));
        });
    }
    if (moduleOption?.modules?.length) {
        moduleOption.modules.forEach((r) => {
            collectedData.push(...(0, exports.moduleFactory)(r, moduleCorsPolicy || corsPolicy));
        });
    }
    // 验重
    const mappedCollection = collectedData.map((r) => r.path + r.requestMethod);
    const beforeLength = mappedCollection.length;
    const afterLength = new Set(mappedCollection).size;
    if (beforeLength !== afterLength) {
        throw new Error('含有重复的路由');
    }
    return collectedData;
};
exports.moduleFactory = moduleFactory;
const routerFactory = (controllerClass, moduleCorsPolicy = undefined) => {
    const prototype = controllerClass.prototype;
    // 获取构造函数的path元数据
    const rootPath = Reflect.getMetadata(decorator_1.METADATA_KEY.PATH, prototype.constructor);
    const controllerCorsPolicy = Reflect.getMetadata(decorator_1.METADATA_KEY.Cors, prototype.constructor);
    // 获取非构造函数的方法
    const methods = Reflect.ownKeys(prototype).filter((item) => item !== 'constructor');
    const collected = methods.map((methodKey) => {
        const requestHandler = prototype[methodKey];
        // 获取方法的path元数据
        const path = Reflect.getMetadata(decorator_1.METADATA_KEY.PATH, requestHandler);
        // 获取方法上请求方法的元数据
        const requestMethod = Reflect.getMetadata(decorator_1.METADATA_KEY.METHOD, requestHandler).replace('ioc:', '').toUpperCase();
        const queryParameterMetadatas = queryFactory(controllerClass, requestHandler);
        const paramParameterMetadatas = paramFactory(controllerClass, requestHandler);
        const bodyParameterMetadatas = bodyFactory(controllerClass, requestHandler);
        const headerParameterMetadatas = headerFactory(controllerClass, requestHandler);
        const fileParameterMetadatas = fileFactory(controllerClass, requestHandler);
        const filesParameterMetadatas = filesFactory(controllerClass, requestHandler);
        const methodCorsPolicy = Reflect.getMetadata(decorator_1.METADATA_KEY.Cors, controllerClass.prototype, requestHandler.name);
        return {
            path: `${rootPath}${path}`,
            requestMethod,
            requestHandler,
            corsPolicy: methodCorsPolicy || controllerCorsPolicy || moduleCorsPolicy,
            requestHandlerParameters: queryParameterMetadatas.concat(paramParameterMetadatas, bodyParameterMetadatas, headerParameterMetadatas, fileParameterMetadatas, filesParameterMetadatas)
        };
    });
    return collected;
};
const parameterFactory = (metadataKey) => {
    return (object, handler) => {
        const objectParameterMetadatas = [];
        for (let i = 0; i < handler.length; i++) {
            const metadata = Reflect.getMetadata(metadataKey, object.prototype, `${handler.name}.${i}`);
            if (metadata) {
                objectParameterMetadatas.push(metadata);
            }
        }
        return objectParameterMetadatas;
    };
};
const paramFactory = parameterFactory(decorator_1.METADATA_KEY.PARAM);
const queryFactory = parameterFactory(decorator_1.METADATA_KEY.QUERY);
const bodyFactory = parameterFactory(decorator_1.METADATA_KEY.BODY);
const headerFactory = parameterFactory(decorator_1.METADATA_KEY.HEADER);
const fileFactory = parameterFactory(decorator_1.METADATA_KEY.File);
const filesFactory = parameterFactory(decorator_1.METADATA_KEY.Files);
