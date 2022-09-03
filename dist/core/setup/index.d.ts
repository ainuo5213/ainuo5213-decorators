import { ParameterFromType } from '../request/decorator';
import { ICollected } from '../request/factory';
export declare type ParameterObjectType = {
    parameterValue: any;
    paramFrom: ParameterFromType;
    parameterIndex: number;
};
export declare type FileInfoData = {
    fileData: any;
    fileName: string;
    fieldName: string;
};
export declare type FileParameterObjectType = ParameterObjectType & {
    fileInfo: FileInfoData;
};
export declare type FilesParameterObjectType = ParameterObjectType & {
    fileInfos: FileInfoData[];
};
export declare type FileParameterData = {
    fileInfo: {
        fieldName: string;
        fileName: string;
    };
    fileData: any;
};
export declare type CollectedValueType = Pick<ICollected, 'path' | 'requestHandler' | 'requestMethod'>;
export default class Server<T extends Function> {
    private collected;
    private static instance;
    private constructor();
    static create(module: Function): Server<Function>;
    listen(port: number): Promise<void>;
    private handleRequest;
    private setCorsPolicy;
    private handleParameter;
    private handleParameterFromFiles;
    private handleParameterFromFile;
    private handleParameterFromHeader;
    private handleParameterFromBody;
    private handleParameterFromQuery;
    private handleParameterFromParam;
}
