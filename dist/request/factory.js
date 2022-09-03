"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesFactory = exports.fileFactory = exports.headerFactory = exports.bodyFactory = exports.queryFactory = exports.paramFactory = exports.parameterFactory = exports.corsPolicyFactory = exports.routerFactory = exports.moduleFactory = void 0;
const decorator_1 = require("./decorator");
const moduleFactory = (moduleClass, corsPolicy = undefined) => {
    const prototype = moduleClass.prototype;
    const moduleOption = Reflect.getMetadata(decorator_1.METADATA_KEY.MODULE, prototype.constructor);
    const moduleCorsPolicy = Reflect.getMetadata(decorator_1.METADATA_KEY.Cors, prototype.constructor);
    const collectedData = [];
    if (moduleOption?.controllers?.length) {
        moduleOption.controllers.forEach((r) => {
            collectedData.push(...(0, exports.routerFactory)(r, moduleCorsPolicy || corsPolicy));
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
        const queryParameterMetadatas = (0, exports.queryFactory)(controllerClass, requestHandler);
        const paramParameterMetadatas = (0, exports.paramFactory)(controllerClass, requestHandler);
        const bodyParameterMetadatas = (0, exports.bodyFactory)(controllerClass, requestHandler);
        const headerParameterMetadatas = (0, exports.headerFactory)(controllerClass, requestHandler);
        const fileParameterMetadatas = (0, exports.fileFactory)(controllerClass, requestHandler);
        const filesParameterMetadatas = (0, exports.filesFactory)(controllerClass, requestHandler);
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
exports.routerFactory = routerFactory;
const corsPolicyFactory = (object, handler) => {
    return Reflect.getMetadata(decorator_1.METADATA_KEY.Cors, object.prototype, handler.name);
};
exports.corsPolicyFactory = corsPolicyFactory;
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
exports.parameterFactory = parameterFactory;
exports.paramFactory = (0, exports.parameterFactory)(decorator_1.METADATA_KEY.PARAM);
exports.queryFactory = (0, exports.parameterFactory)(decorator_1.METADATA_KEY.QUERY);
exports.bodyFactory = (0, exports.parameterFactory)(decorator_1.METADATA_KEY.BODY);
exports.headerFactory = (0, exports.parameterFactory)(decorator_1.METADATA_KEY.HEADER);
exports.fileFactory = (0, exports.parameterFactory)(decorator_1.METADATA_KEY.File);
exports.filesFactory = (0, exports.parameterFactory)(decorator_1.METADATA_KEY.Files);
