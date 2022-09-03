"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleCors = exports.ControllerCors = exports.MethodCors = exports.Head = exports.Delete = exports.Patch = exports.Put = exports.Option = exports.Post = exports.Get = exports.Files = exports.File = exports.Header = exports.Body = exports.Query = exports.Param = exports.BodySymbolId = exports.Module = exports.Controller = exports.METADATA_KEY = void 0;
require("reflect-metadata");
var METADATA_KEY;
(function (METADATA_KEY) {
    METADATA_KEY["METHOD"] = "ioc:method";
    METADATA_KEY["PATH"] = "ioc:path";
    METADATA_KEY["MIDDLEWARE"] = "ioc:middleware";
    METADATA_KEY["MODULE"] = "ioc:module";
    METADATA_KEY["PARAM"] = "ioc:param";
    METADATA_KEY["QUERY"] = "ioc:query";
    METADATA_KEY["BODY"] = "ioc:body";
    METADATA_KEY["HEADER"] = "ioc:header";
    METADATA_KEY["File"] = "ioc:file";
    METADATA_KEY["Files"] = "ioc:files";
    METADATA_KEY["Cors"] = "ioc:cros";
})(METADATA_KEY = exports.METADATA_KEY || (exports.METADATA_KEY = {}));
var REQUEST_METHOD;
(function (REQUEST_METHOD) {
    REQUEST_METHOD["GET"] = "ioc:get";
    REQUEST_METHOD["POST"] = "ioc:post";
    REQUEST_METHOD["OPTION"] = "ioc:option";
    REQUEST_METHOD["PUT"] = "ioc:put";
    REQUEST_METHOD["PATCH"] = "ioc:patch";
    REQUEST_METHOD["DELETE"] = "ioc:delete";
    REQUEST_METHOD["HEAD"] = "ioc:head";
})(REQUEST_METHOD || (REQUEST_METHOD = {}));
const methodDecoratorFactory = (method) => {
    return (path) => {
        return (_target, _key, descriptor) => {
            Reflect.defineMetadata(METADATA_KEY.METHOD, method, descriptor.value);
            Reflect.defineMetadata(METADATA_KEY.PATH, path, descriptor.value);
        };
    };
};
function addParameter(metadataKey, paramFrom, parameterName) {
    return (target, propKey, paramIndex) => {
        const parameter = {
            index: paramIndex,
            injectParameterKey: parameterName,
            paramFrom: paramFrom
        };
        Reflect.defineMetadata(metadataKey, parameter, target, `${propKey}.${paramIndex}`);
    };
}
const parameterMoreDecoratorFactory = (metadataKey) => {
    const paramFrom = metadataKey.slice('ioc:'.length);
    return (parameterName) => addParameter(metadataKey, paramFrom, parameterName);
};
const parameterWithoutDecoratorFactory = (metadataKey) => {
    const paramFrom = metadataKey.slice('ioc:'.length);
    return () => addParameter(metadataKey, paramFrom, exports.BodySymbolId);
};
const Controller = (path) => {
    return (target) => {
        Reflect.defineMetadata(METADATA_KEY.PATH, path ?? '', target);
    };
};
exports.Controller = Controller;
const Module = (option) => {
    return (target) => {
        Reflect.defineMetadata(METADATA_KEY.MODULE, option, target);
    };
};
exports.Module = Module;
exports.BodySymbolId = Symbol('body');
// 参数装饰器
exports.Param = parameterMoreDecoratorFactory(METADATA_KEY.PARAM);
exports.Query = parameterMoreDecoratorFactory(METADATA_KEY.QUERY);
exports.Body = parameterWithoutDecoratorFactory(METADATA_KEY.BODY);
exports.Header = parameterMoreDecoratorFactory(METADATA_KEY.HEADER);
exports.File = parameterMoreDecoratorFactory(METADATA_KEY.File);
exports.Files = parameterWithoutDecoratorFactory(METADATA_KEY.Files);
// 方法装饰器
exports.Get = methodDecoratorFactory(REQUEST_METHOD.GET);
exports.Post = methodDecoratorFactory(REQUEST_METHOD.POST);
exports.Option = methodDecoratorFactory(REQUEST_METHOD.OPTION);
exports.Put = methodDecoratorFactory(REQUEST_METHOD.PUT);
exports.Patch = methodDecoratorFactory(REQUEST_METHOD.PATCH);
exports.Delete = methodDecoratorFactory(REQUEST_METHOD.DELETE);
exports.Head = methodDecoratorFactory(REQUEST_METHOD.HEAD);
const MethodCors = (policy) => {
    return (target, key, descriptor) => {
        if (policy) {
            Reflect.defineMetadata(METADATA_KEY.Cors, policy, target, key);
        }
    };
};
exports.MethodCors = MethodCors;
const ControllerCors = (policy) => {
    return (target) => {
        if (policy) {
            Reflect.defineMetadata(METADATA_KEY.Cors, policy, target);
        }
    };
};
exports.ControllerCors = ControllerCors;
const ModuleCors = (policy) => {
    return (target) => {
        if (policy) {
            Reflect.defineMetadata(METADATA_KEY.Cors, policy, target);
        }
    };
};
exports.ModuleCors = ModuleCors;
