import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	NodeOperationError,
} from 'n8n-workflow';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import NodeUtils from '../../../help/utils/NodeUtils';
import ODataUtils from '../../../help/utils/ODataUtils';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
	latestVersionOption,
	manualNonceOption,
	odataCountOption,
	odataExpandOption,
	odataFilterOption,
	odataOrderByOption,
	odataSelectOption,
	paginationOptions,
	skipNonceOption,
	wildcardSearchOption,
} from '../../../help/utils/sharedOptions';

function getOptionalJsonObject(
	context: IExecuteFunctions,
	paramName: string,
	index: number,
): IDataObject {
	const parsed = NodeUtils.getNodeJsonData<unknown>(context, paramName, index, {});
	if (parsed === undefined || parsed === null) {
		return {};
	}
	if (typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new NodeOperationError(context.getNode(), `${paramName} must be a JSON object`, {
			itemIndex: index,
		});
	}
	return parsed as IDataObject;
}

const CustomRequestOperate: ResourceOperations = {
	name: '自定义 OData 请求 (CustomRequest)',
	value: 'odata:customRequest',
	action: '自定义 OData 请求 (CustomRequest)',
	description:
		'发送自定义 Windchill OData 请求（支持 GET/POST/PATCH/PUT/DELETE、GET 自动分页与写操作自动 NONCE）',
	order: 50,
	options: [
		{
			displayName: 'HTTP Method',
			name: 'method',
			type: 'options',
			required: true,
			default: 'GET',
			options: [
				{ name: 'DELETE', value: 'DELETE' },
				{ name: 'GET', value: 'GET' },
				{ name: 'PATCH', value: 'PATCH' },
				{ name: 'POST', value: 'POST' },
				{ name: 'PUT', value: 'PUT' },
			],
			description: '选择 HTTP 请求方法',
		},
		{
			displayName: 'Path',
			name: 'path',
			type: 'string',
			required: true,
			default: '/',
			placeholder: '/ProdMgmt/Parts',
			description: '相对于 Windchill OData 根地址的请求路径（例如 /ProdMgmt/Parts）',
		},
		{
			displayName: 'Query Parameters (JSON)',
			name: 'queryParams',
			type: 'json',
			default: '{}',
			description: 'URL 查询参数 JSON 对象（将与 Options 中的 OData 查询选项合并）',
		},
		{
			displayName: 'Headers (JSON)',
			name: 'headers',
			type: 'json',
			default: '{}',
			description: '自定义请求头 JSON 对象',
		},
		{
			displayName: 'Body (JSON)',
			name: 'body',
			type: 'json',
			default: '{}',
			displayOptions: {
				show: {
					method: ['POST', 'PATCH', 'PUT'],
				},
			},
			description: '请求体 JSON 数据（POST / PATCH / PUT 时发送）',
		},
		{
			...paginationOptions.returnAll,
			displayOptions: {
				show: {
					method: ['GET'],
				},
			},
		},
		{
			...paginationOptions.limit(1000, 1, 50),
			displayOptions: {
				show: {
					method: ['GET'],
					returnAll: [false],
				},
			},
		},
		createCommonOptions([
			odataFilterOption,
			odataSelectOption,
			odataExpandOption,
			odataOrderByOption,
			odataCountOption,
			wildcardSearchOption,
			latestVersionOption,
			apiVersionOption,
			skipNonceOption,
			manualNonceOption,
		]),
	],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const method = String(this.getNodeParameter('method', index, 'GET') || 'GET').toUpperCase() as
			| 'GET'
			| 'POST'
			| 'PATCH'
			| 'PUT'
			| 'DELETE';
		const rawPath = String(this.getNodeParameter('path', index, '') || '').trim();
			if (!rawPath) {
				throw new NodeOperationError(this.getNode(), 'Path cannot be empty', { itemIndex: index });
			}
			if (/^https?:\/\//i.test(rawPath)) {
				throw new NodeOperationError(
					this.getNode(),
					'Absolute URLs are not allowed in Custom Request path; use a path relative to the Windchill OData base URL',
					{ itemIndex: index },
				);
			}
			if (rawPath.includes('..')) {
				throw new NodeOperationError(this.getNode(), 'Path must not contain ".."', {
					itemIndex: index,
				});
			}

			const queryParams = getOptionalJsonObject(this, 'queryParams', index);
			const customHeadersObj = getOptionalJsonObject(this, 'headers', index);
			const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

			const { qs: odataQs, headers: odataHeaders } = ODataUtils.buildODataQueryAndHeaders(options);
			const qs: IDataObject = {
				...odataQs,
				...queryParams,
			};

			const headers: Record<string, string> = { ...odataHeaders };
			for (const [k, v] of Object.entries(customHeadersObj)) {
				if (v !== undefined && v !== null) {
					headers[k] = String(v);
				}
			}

			if (method === 'GET') {
				const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
				const limit = returnAll ? undefined : (this.getNodeParameter('limit', index, 50) as number);

				return ODataUtils.executePaginatedQuery.call(
					this,
					{
						url: rawPath,
						returnAll,
						limit,
						qs,
						headers,
						apiVersion: options.apiVersion,
						timeout: options.timeout,
					},
					index,
				);
			}

		let body: IDataObject | undefined;
		if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
			body = getOptionalJsonObject(this, 'body', index);
		}

		const response = await RequestUtils.request.call(
			this,
			{
				method: method as IHttpRequestMethods,
				url: rawPath,
				qs,
				headers,
				...(body !== undefined ? { body } : {}),
				apiVersion: options.apiVersion,
				skipNonce: options.skipNonce,
				manualNonce: options.manualNonce,
				timeout: options.timeout,
			},
			index,
		);

		if (response === undefined || response === null || response === '') {
			return method === 'DELETE'
				? { deleted: true, path: rawPath }
				: { success: true, path: rawPath };
		}
		if (typeof response === 'string') {
			return { body: response };
		}
		return response as IDataObject;
	},
};

export default CustomRequestOperate;
