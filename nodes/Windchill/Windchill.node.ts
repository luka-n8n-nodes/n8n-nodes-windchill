import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
} from 'n8n-workflow';
import ResourceFactory from '../help/builder/ResourceFactory';
import { Credentials, OutputType } from '../help/type/enums';
import {
	IBinaryOperationResult,
	ICustomOutputOperationResult,
	OperationCallFunction,
	OperationResult,
} from '../help/type/IResource';
import { ICommonOptionsValue } from '../help/utils/sharedOptions';
import RequestUtils, { clearNonceCache } from '../help/utils/RequestUtils';

const resourceBuilder = ResourceFactory.build(__dirname);

/**
 * 批次配置接口
 */
interface IBatchConfig {
	/** 是否启用并发模式（用户是否显式添加了 Batching 选项） */
	enabled: boolean;
	/** 每批请求数量（并发上限） */
	batchSize: number;
	/** 批次间隔（毫秒） */
	batchInterval: number;
}

/**
 * 请求结果类型（用于并发执行）
 */
interface IRequestResult {
	itemIndex: number;
	result?: OperationResult;
	error?: Error;
}

/**
 * 从 options 参数中获取批次配置
 */
function getBatchConfig(context: IExecuteFunctions): IBatchConfig {
	try {
		const options = context.getNodeParameter('options', 0, {}) as ICommonOptionsValue;
		const batch = options?.batching?.batch;

		const batchingEnabled = batch !== undefined;
		const batchSize = batch?.batchSize ?? 50;
		const batchInterval = batch?.batchInterval ?? 1000;

		return {
			enabled: batchingEnabled,
			batchSize: batchSize === 0 ? 1 : batchSize,
			batchInterval,
		};
	} catch {
		return { enabled: false, batchSize: 50, batchInterval: 1000 };
	}
}

/**
 * 获取错误信息
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

/**
 * 获取错误堆栈
 */
function getErrorStack(error: unknown): string | undefined {
	if (error instanceof Error) {
		return error.stack;
	}
	return undefined;
}

/**
 * 检查响应是否为自定义输出类型
 */
function isCustomOutputResponse(
	response: OperationResult,
): response is IBinaryOperationResult | ICustomOutputOperationResult {
	return (
		response !== null &&
		typeof response === 'object' &&
		!Array.isArray(response) &&
		'outputType' in response &&
		(response as ICustomOutputOperationResult).outputType !== undefined
	);
}

/**
 * 处理单个响应数据
 */
function processResponseData(
	context: IExecuteFunctions,
	responseData: OperationResult,
	itemIndex: number,
): { data: INodeExecutionData[] | null; multipleOutput?: INodeExecutionData[][] } {
	if (isCustomOutputResponse(responseData)) {
		const { outputType } = responseData;

		if (outputType === OutputType.Binary) {
			const binaryResult = responseData as IBinaryOperationResult;
			return {
				data: [
					{
						json: binaryResult.json ?? {},
						binary: binaryResult.binary ?? {},
						pairedItem: { item: itemIndex },
					},
				],
			};
		}

		if (outputType === OutputType.Multiple && responseData.outputData) {
			return { data: null, multipleOutput: responseData.outputData };
		}

		if (outputType === OutputType.None) {
			return { data: null };
		}

		if (outputType === OutputType.PassThrough) {
			const inputItem = context.getInputData()[itemIndex];
			return {
				data: [
					{
						json: inputItem.json,
						binary: inputItem.binary,
						pairedItem: { item: itemIndex },
					},
				],
			};
		}
	}

	const executionData = context.helpers.constructExecutionMetaData(
		context.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
		{ itemData: { item: itemIndex } },
	);

	return { data: executionData };
}

/**
 * 创建错误输出数据
 */
function createErrorData(
	context: IExecuteFunctions,
	error: unknown,
	itemIndex: number,
): INodeExecutionData[] {
	return context.helpers.constructExecutionMetaData(
		context.helpers.returnJsonArray(RequestUtils.toErrorOutput(error)),
		{ itemData: { item: itemIndex } },
	);
}

/**
 * 串行执行模式
 */
async function executeSerial(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	callFunc: OperationCallFunction,
	resource: string,
	operation: string,
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[][] = [[]];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {
			context.logger.debug('call function (serial)', {
				resource,
				operation,
				itemIndex,
			});

			const responseData = await callFunc.call(context, itemIndex);
			const processed = processResponseData(context, responseData, itemIndex);

			if (processed.multipleOutput) {
				return processed.multipleOutput;
			}

			if (processed.data === null && !processed.multipleOutput) {
				continue;
			}

			if (processed.data) {
				returnData[0].push(...processed.data);
			}
		} catch (error) {
			context.logger.error('call function error (serial)', {
				resource,
				operation,
				itemIndex,
				errorMessage: getErrorMessage(error),
				stack: getErrorStack(error),
			});

			if (context.continueOnFail()) {
				returnData[0].push(...createErrorData(context, error, itemIndex));
				continue;
			}
			throw error;
		}
	}

	return returnData;
}

/**
 * 有界并发执行：每批最多 batchSize 个请求同时进行，等本批全部完成后再间隔并启动下一批
 */
async function executeParallel(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	callFunc: OperationCallFunction,
	batchConfig: IBatchConfig,
	resource: string,
	operation: string,
): Promise<INodeExecutionData[][]> {
	const { batchSize, batchInterval } = batchConfig;
	const returnData: INodeExecutionData[][] = [[]];
	const orderedResults: IRequestResult[] = new Array(items.length);

	for (let start = 0; start < items.length; start += batchSize) {
		if (start > 0 && batchInterval > 0) {
			await sleep(batchInterval);
		}

		const end = Math.min(start + batchSize, items.length);
		const batchPromises: Promise<IRequestResult>[] = [];

		for (let itemIndex = start; itemIndex < end; itemIndex++) {
			context.logger.debug('call function (parallel)', {
				resource,
				operation,
				itemIndex,
				batch: Math.floor(itemIndex / batchSize),
			});

			batchPromises.push(
				callFunc
					.call(context, itemIndex)
					.then((result): IRequestResult => ({ itemIndex, result }))
					.catch((error): IRequestResult => ({ itemIndex, error: error as Error })),
			);
		}

		const batchResults = await Promise.all(batchPromises);
		for (const result of batchResults) {
			orderedResults[result.itemIndex] = result;
		}

		// 本批若有失败且未 continueOnFail，立即停止（不再启动后续批次）
		if (!context.continueOnFail()) {
			const firstError = batchResults.find((r) => r.error);
			if (firstError?.error) {
				context.logger.error('call function error (parallel)', {
					resource,
					operation,
					itemIndex: firstError.itemIndex,
					errorMessage: firstError.error.message,
					stack: firstError.error.stack,
				});
				throw firstError.error;
			}
		}
	}

	for (let i = 0; i < orderedResults.length; i++) {
		const { itemIndex, result, error } = orderedResults[i];

		if (error) {
			context.logger.error('call function error (parallel)', {
				resource,
				operation,
				itemIndex,
				errorMessage: error.message,
				stack: error.stack,
			});

			if (context.continueOnFail()) {
				returnData[0].push(...createErrorData(context, error, itemIndex));
				continue;
			}
			throw error;
		}

		if (result === undefined) {
			continue;
		}

		const processed = processResponseData(context, result, itemIndex);

		if (processed.multipleOutput) {
			return processed.multipleOutput;
		}

		if (processed.data === null && !processed.multipleOutput) {
			continue;
		}

		if (processed.data) {
			returnData[0].push(...processed.data);
		}
	}

	return returnData;
}

export class Windchill implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Windchill',
		name: 'windchill',
		subtitle: '={{ $parameter.resource }}:{{ $parameter.operation }}',
		icon: 'file:icon.svg',
		group: ['transform'],
		version: [1],
		defaultVersion: 1,
		description: 'PTC Windchill PLM REST/OData API integration',
		defaults: {
			name: 'Windchill',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: Credentials.WindchillBasicApi,
				displayName: 'Windchill Basic Auth API',
				required: true,
				displayOptions: {
					show: {
						authentication: [Credentials.WindchillBasicApi],
					},
				},
			},
			{
				name: Credentials.WindchillTokenApi,
				displayName: 'Windchill Token / Header API',
				required: true,
				displayOptions: {
					show: {
						authentication: [Credentials.WindchillTokenApi],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Basic Auth API',
						value: Credentials.WindchillBasicApi,
					},
					{
						name: 'Token / Header API',
						value: Credentials.WindchillTokenApi,
					},
				],
				default: Credentials.WindchillBasicApi,
			},
			...resourceBuilder.build(),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		clearNonceCache(this);

		const items = this.getInputData();

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const executeAllFunc = resourceBuilder.getExecuteAll(resource, operation);
		if (executeAllFunc) {
			try {
				return await executeAllFunc.call(this);
			} catch (error) {
				if (this.continueOnFail()) {
					return [
						this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(RequestUtils.toErrorOutput(error)),
							{ itemData: { item: 0 } },
						),
					];
				}
				throw error;
			}
		}

		const callFunc = resourceBuilder.getCall(resource, operation);

		if (!callFunc) {
			throw new NodeOperationError(
				this.getNode(),
				`Operation not implemented: ${resource}.${operation}`,
			);
		}

		const batchConfig = getBatchConfig(this);

		if (batchConfig.enabled) {
			return executeParallel(this, items, callFunc, batchConfig, resource, operation);
		}

		return executeSerial(this, items, callFunc, resource, operation);
	}
}
