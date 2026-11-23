import { INodeProperties } from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from './fieldHints';

/**
 * 批处理选项
 * 用于控制并发请求的批次大小和间隔
 */
export const batchingOption: INodeProperties = {
	displayName: 'Batching',
	name: 'batching',
	placeholder: 'Add Batching',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: false,
	},
	default: {
		batch: {},
	},
	options: [
		{
			displayName: 'Batching',
			name: 'batch',
			values: [
				{
					displayName: 'Items per Batch',
					name: 'batchSize',
					type: 'number',
					typeOptions: {
						minValue: 1,
					},
					default: 50,
					description: '每批并发请求数量。添加此选项后启用并发模式。0 将被视为 1。',
				},
				{
					displayName: 'Batch Interval (Ms)',
					name: 'batchInterval',
					type: 'number',
					typeOptions: {
						minValue: 0,
					},
					default: 1000,
					description: '每批请求之间的时间（毫秒）。0 表示禁用。',
				},
			],
		},
	],
};

/**
 * 超时选项
 * 用于控制请求超时时间
 */
export const timeoutOption: INodeProperties = {
	displayName: 'Timeout',
	name: 'timeout',
	type: 'number',
	typeOptions: {
		minValue: 0,
	},
	default: 0,
	description:
		'等待服务器发送响应头（并开始响应体）的时间（毫秒），超过此时间将中止请求。0 表示不限制超时。',
};

/**
 * 创建带有自定义扩展项的 Options 集合，并始终在末尾追加 Batching 和 Timeout
 */
export function createCommonOptions(extraOptions: INodeProperties[] = []): INodeProperties {
	const filtered = extraOptions.filter(
		(opt) => opt.name !== batchingOption.name && opt.name !== timeoutOption.name,
	);
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [...filtered, batchingOption, timeoutOption],
	};
}

/**
 * 通用 Options 参数值类型定义
 */
export interface ICommonOptionsValue {
	batching?: {
		batch?: {
			batchSize?: number;
			batchInterval?: number;
		};
	};
	timeout?: number;
	filter?: string;
	select?: string;
	expand?: string;
	orderby?: string;
	count?: boolean;
	wildcardSearch?: boolean | string;
	latestVersion?: boolean;
	apiVersion?: string;
	skipNonce?: boolean;
	manualNonce?: string;
	fileName?: string;
	mimeType?: string;
	[key: string]: unknown;
}

/**
 * 分页参数选项
 */
export const paginationOptions = {
	/**
	 * 返回所有结果选项
	 */
	returnAll: {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	} as INodeProperties,

	/**
	 * 限制返回数量选项
	 * @param maxValue 最大值，默认 1000
	 * @param minValue 最小值，默认 1
	 * @param defaultValue 默认值，默认 50
	 */
	limit: (maxValue = 1000, minValue = 1, defaultValue = 50): INodeProperties => ({
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: defaultValue,
		typeOptions: {
			minValue,
			maxValue,
		},
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	}),
};

/**
 * OData $filter 选项
 */
export const odataFilterOption: INodeProperties = {
	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
	displayName: 'Filter ($filter)',
	name: 'filter',
	type: 'string',
	default: '',
	placeholder: "Number eq '000001'",
	description: FieldDescriptions.filter,
	hint: FieldHints.metadataFields,
};

/**
 * OData $select 选项
 */
export const odataSelectOption: INodeProperties = {
	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
	displayName: 'Select ($select)',
	name: 'select',
	type: 'string',
	default: '',
	placeholder: 'ID,Number,Name',
	description: FieldDescriptions.select,
	hint: FieldHints.metadataFields,
};

/**
 * OData $expand 选项
 */
export const odataExpandOption: INodeProperties = {
	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
	displayName: 'Expand ($expand)',
	name: 'expand',
	type: 'string',
	default: '',
	placeholder: 'Folder,CreatedBy',
	description: FieldDescriptions.expand,
	hint: FieldHints.navigation,
};

/**
 * OData $orderby 选项
 */
export const odataOrderByOption: INodeProperties = {
	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
	displayName: 'Order By ($orderby)',
	name: 'orderby',
	type: 'string',
	default: '',
	placeholder: 'ModifiedOn desc',
	description: FieldDescriptions.orderby,
	hint: FieldHints.metadataFields,
};

/**
 * OData $count 选项
 */
export const odataCountOption: INodeProperties = {
	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
	displayName: 'Include Count ($count)',
	name: 'count',
	type: 'boolean',
	default: false,
	description: 'Whether to include total result count ($count=true)',
};

/**
 * Windchill 通配符搜索选项（PTC-WildcardSearch 请求头）
 */
export const wildcardSearchOption: INodeProperties = {
	displayName: 'Wildcard Search (PTC-WildcardSearch)',
	name: 'wildcardSearch',
	type: 'boolean',
	default: false,
	description: 'Whether to send PTC-WildcardSearch: true header for wildcard query matching',
};

/**
 * Windchill 最新版本查询选项（ptc.search.latestversion 查询参数）
 */
export const latestVersionOption: INodeProperties = {
	displayName: 'Latest Version Only (ptc.search.latestversion)',
	name: 'latestVersion',
	type: 'boolean',
	default: false,
	description: 'Whether to restrict results to latest versions (ptc.search.latestversion=true)',
};

/**
 * 单操作覆盖 API 版本选项
 */
export const apiVersionOption: INodeProperties = {
	displayName: 'API Version',
	name: 'apiVersion',
	type: 'string',
	default: '',
	placeholder: 'v5',
	description: FieldDescriptions.apiVersion,
};

/**
 * 跳过自动 CSRF_NONCE 获取选项
 */
export const skipNonceOption: INodeProperties = {
	displayName: 'Skip CSRF_NONCE Token',
	name: 'skipNonce',
	type: 'boolean',
	default: false,
	description: FieldDescriptions.skipNonce,
};

/**
 * 手动指定 CSRF_NONCE Token 选项
 */
export const manualNonceOption: INodeProperties = {
	displayName: 'Manual CSRF_NONCE Token',
	name: 'manualNonce',
	type: 'string',
	default: '',
	description: FieldDescriptions.manualNonce,
};

/**
 * 输出二进制字段选项（下载用）
 */
export const binaryPropertyNameOption: INodeProperties = {
	displayName: 'Put Output File in Field',
	name: 'binaryPropertyName',
	type: 'string',
	default: 'data',
	required: true,
	description: 'The name of the output binary field to put the file in',
};

/**
 * 自定义文件名选项
 */
export const fileNameOption: INodeProperties = {
	displayName: 'File Name',
	name: 'fileName',
	type: 'string',
	default: '',
	description: '可选自定义文件名；留空则从响应头或默认名称自动获取',
};

/**
 * MIME Type 选项
 */
export const mimeTypeOption: INodeProperties = {
	displayName: 'MIME Type',
	name: 'mimeType',
	type: 'string',
	default: '',
	description: '可选自定义文件 MIME 类型；留空则从响应头自动识别',
};
