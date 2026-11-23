import {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { OutputType } from './enums';

/**
 * 二进制下载操作返回结果类型
 */
export interface IBinaryOperationResult {
	outputType: OutputType.Binary;
	json: IDataObject;
	binary: IBinaryKeyData;
}

/**
 * 自定义输出操作返回结果类型
 */
export interface ICustomOutputOperationResult {
	outputType: OutputType;
	outputData?: INodeExecutionData[][];
	json?: IDataObject;
	binary?: IBinaryKeyData;
}

/**
 * 操作返回结果类型
 * 支持单输出、多输出、二进制输出和自定义输出
 */
export type OperationResult =
	| IDataObject
	| IDataObject[]
	| IBinaryOperationResult
	| ICustomOutputOperationResult;

/**
 * 操作调用函数类型
 */
export type OperationCallFunction = (
	this: IExecuteFunctions,
	index: number,
) => Promise<OperationResult>;

/**
 * 跨输入项批量执行函数类型
 */
export type OperationExecuteAllFunction = (
	this: IExecuteFunctions,
) => Promise<INodeExecutionData[][]>;

/**
 * 资源操作定义
 */
export type ResourceOperations = INodePropertyOptions & {
	/** 操作的参数选项列表 */
	options: INodeProperties[];
	/** 操作执行函数 */
	call?: OperationCallFunction;
	/** 跨输入项批量执行函数 */
	executeAll?: OperationExecuteAllFunction;
	/** 排序顺序，默认 100 */
	order?: number;
};

/**
 * 资源选项定义
 */
export type ResourceOptions = INodePropertyOptions & {
	/** 排序顺序，默认 100 */
	order?: number;
};

/**
 * 资源接口定义
 */
export interface IResource extends INodePropertyOptions {
	/** 资源下的操作列表 */
	operations: ResourceOperations[];
}

/**
 * 资源选项（用于构建节点属性时移除 operations）
 */
export type ResourceOptionWithoutOperations = Omit<IResource, 'operations'> & {
	operations: null;
};

/**
 * 操作选项（用于构建节点属性时移除 options 和 call）
 */
export type OperationOptionWithoutDetails = Omit<ResourceOperations, 'options' | 'call'> & {
	options: null;
};
