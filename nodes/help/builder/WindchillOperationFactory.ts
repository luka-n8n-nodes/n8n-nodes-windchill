import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { OutputType } from '../type/enums';
import { OperationResult, ResourceOperations } from '../type/IResource';
import NodeUtils from '../utils/NodeUtils';
import ODataUtils from '../utils/ODataUtils';
import RequestUtils from '../utils/RequestUtils';
import { FieldDescriptions, FieldHints } from '../utils/fieldHints';
import {
	apiVersionOption,
	binaryPropertyNameOption,
	createCommonOptions,
	fileNameOption,
	ICommonOptionsValue,
	latestVersionOption,
	manualNonceOption,
	mimeTypeOption,
	odataCountOption,
	odataExpandOption,
	odataFilterOption,
	odataOrderByOption,
	odataSelectOption,
	paginationOptions,
	skipNonceOption,
	wildcardSearchOption,
} from '../utils/sharedOptions';

export type PathResolver =
	| string
	| ((this: IExecuteFunctions, index: number) => string | Promise<string>);

export interface IIdParamConfig {
	name?: string;
	displayName?: string;
	description?: string;
	placeholder?: string;
	default?: string;
	required?: boolean;
	hint?: string;
}

export interface IBaseOperateConfig {
	name: string;
	value: string;
	description?: string;
	action?: string;
	order?: number;
	path: PathResolver;
	extraProperties?: INodeProperties[];
	extraOptions?: INodeProperties[];
}

export interface IEntityListOperateConfig extends IBaseOperateConfig {
	includeWildcardSearch?: boolean;
	includeLatestVersion?: boolean;
	includeCount?: boolean;
	defaultLimit?: number;
	maxLimit?: number;
	pageSize?: number;
	buildQuery?: (this: IExecuteFunctions, index: number) => IDataObject | Promise<IDataObject>;
}

export interface IEntityGetOperateConfig extends IBaseOperateConfig {
	idParam?: false | IIdParamConfig;
	buildQuery?: (this: IExecuteFunctions, index: number) => IDataObject | Promise<IDataObject>;
}

export interface IEntityCreateOperateConfig extends IBaseOperateConfig {
	fields?: INodeProperties[];
	includeJsonBody?: boolean;
	bodyParamName?: string;
	bodyDisplayName?: string;
	bodyDescription?: string;
	bodyRequired?: boolean;
	buildBody?: (this: IExecuteFunctions, index: number) => IDataObject | Promise<IDataObject>;
}

export interface IEntityUpdateOperateConfig extends IEntityCreateOperateConfig {
	idParam?: false | IIdParamConfig;
	method?: 'PATCH' | 'PUT';
}

export interface IEntityDeleteOperateConfig extends IBaseOperateConfig {
	idParam?: false | IIdParamConfig;
}

export interface IFunctionOperateConfig extends IBaseOperateConfig {
	idParam?: false | IIdParamConfig;
	functionName?: string;
	params?: INodeProperties[];
	paginated?: boolean;
	defaultLimit?: number;
	maxLimit?: number;
	pageSize?: number;
	buildQuery?: (this: IExecuteFunctions, index: number) => IDataObject | Promise<IDataObject>;
}

export interface IActionOperateConfig extends IBaseOperateConfig {
	idParam?: false | IIdParamConfig;
	actionName?: string;
	fields?: INodeProperties[];
	includeJsonBody?: boolean;
	bodyParamName?: string;
	bodyDisplayName?: string;
	bodyDescription?: string;
	bodyRequired?: boolean;
	buildBody?: (this: IExecuteFunctions, index: number) => IDataObject | Promise<IDataObject>;
}

export interface IBinaryDownloadOperateConfig extends IBaseOperateConfig {
	idParam?: false | IIdParamConfig;
	subPath?: string;
	defaultFileName?: string;
	defaultMimeType?: string;
}

function buildIdProperty(idParam?: IIdParamConfig): INodeProperties {
	return {
		displayName: idParam?.displayName ?? 'ID',
		name: idParam?.name ?? 'id',
		type: 'string',
		required: idParam?.required ?? true,
		default: idParam?.default ?? '',
		placeholder: idParam?.placeholder ?? 'OR:wt.part.WTPart:12345',
		description: idParam?.description ?? FieldDescriptions.oid,
		hint: idParam?.hint ?? FieldHints.oid,
	};
}

async function resolvePath(
	context: IExecuteFunctions,
	path: PathResolver,
	index: number,
): Promise<string> {
	return typeof path === 'function' ? path.call(context, index) : path;
}

async function resolveEntityOrMemberUrl(
	context: IExecuteFunctions,
	path: PathResolver,
	index: number,
	idParam?: false | IIdParamConfig,
	memberSuffix?: string,
): Promise<{ url: string; id?: string }> {
	const basePath = await resolvePath(context, path, index);
	let entityUrl = basePath;
	let idValue: string | undefined;

	if (idParam !== false) {
		const paramName = idParam?.name ?? 'id';
		idValue = String(context.getNodeParameter(paramName, index, '') || '').trim();
		if (basePath.includes(`{${paramName}}`)) {
			entityUrl = basePath.replace(`{${paramName}}`, ODataUtils.encodeODataKey(idValue));
		} else if (idValue) {
			entityUrl = ODataUtils.buildEntityUrl(basePath, idValue);
		}
	}

	if (memberSuffix) {
		const cleanSuffix = memberSuffix.replace(/^\/+/, '');
		entityUrl = `${entityUrl.replace(/\/+$/, '')}/${cleanSuffix}`;
	}

	return { url: entityUrl, id: idValue };
}

function collectFieldsPayload(
	context: IExecuteFunctions,
	fields: INodeProperties[] | undefined,
	index: number,
): IDataObject {
	const payload: IDataObject = {};
	if (!fields || fields.length === 0) {
		return payload;
	}

	for (const field of fields) {
		const val = context.getNodeParameter(field.name, index, undefined);
		if (val !== undefined && val !== null && val !== '') {
			payload[field.name] = val as IDataObject[string];
		}
	}
	return payload;
}

function parseFilenameFromContentDisposition(header?: string): string | undefined {
	if (!header) return undefined;
	const utf8Match = header.match(/filename\*=UTF-8''([^;\r\n]+)/i);
	if (utf8Match?.[1]) {
		try {
			return decodeURIComponent(utf8Match[1].trim().replace(/^["']|["']$/g, ''));
		} catch {
			return utf8Match[1].trim();
		}
	}
	const plainMatch = header.match(/filename="?([^";\r\n]+)"?/i);
	return plainMatch?.[1]?.trim() || undefined;
}

class WindchillOperationFactory {
	/**
	 * 构建列表查询操作（自动包含 Return All + Limit 分页、OData 查询选项、Batching + Timeout）
	 */
	static createEntityListOperate(config: IEntityListOperateConfig): ResourceOperations {
		const extraODataOptions: INodeProperties[] = [
			odataFilterOption,
			odataSelectOption,
			odataExpandOption,
			odataOrderByOption,
		];
		if (config.includeCount !== false) {
			extraODataOptions.push(odataCountOption);
		}
		if (config.includeWildcardSearch !== false) {
			extraODataOptions.push(wildcardSearchOption);
		}
		if (config.includeLatestVersion !== false) {
			extraODataOptions.push(latestVersionOption);
		}
		extraODataOptions.push(apiVersionOption, ...(config.extraOptions ?? []));

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: [
				...(config.extraProperties ?? []),
				paginationOptions.returnAll,
				paginationOptions.limit(config.maxLimit ?? 1000, 1, config.defaultLimit ?? 50),
				createCommonOptions(extraODataOptions),
			],
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const url = await resolvePath(this, config.path, index);
				const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
				const limit = returnAll ? undefined : (this.getNodeParameter('limit', index, 50) as number);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

				const { qs, headers } = ODataUtils.buildODataQueryAndHeaders(options);
				if (config.buildQuery) {
					Object.assign(qs, await config.buildQuery.call(this, index));
				}

				return ODataUtils.executePaginatedQuery.call(
					this,
					{
						url,
						returnAll,
						limit,
						qs,
						headers,
						pageSize: config.pageSize,
						apiVersion: options.apiVersion,
						timeout: options.timeout,
					},
					index,
				);
			},
		};
	}

	/**
	 * 构建单实体详情查询操作（包含 $select / $expand / Batching + Timeout）
	 */
	static createEntityGetOperate(config: IEntityGetOperateConfig): ResourceOperations {
		const properties: INodeProperties[] = [];
		if (config.idParam !== false) {
			properties.push(buildIdProperty(config.idParam));
		}
		properties.push(...(config.extraProperties ?? []));
		properties.push(
			createCommonOptions([
				odataSelectOption,
				odataExpandOption,
				apiVersionOption,
				...(config.extraOptions ?? []),
			]),
		);

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const { url } = await resolveEntityOrMemberUrl(this, config.path, index, config.idParam);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
				const { qs, headers } = ODataUtils.buildODataQueryAndHeaders(options);
				if (config.buildQuery) {
					Object.assign(qs, await config.buildQuery.call(this, index));
				}

				return RequestUtils.request.call(
					this,
					{
						method: 'GET',
						url,
						qs,
						headers,
						apiVersion: options.apiVersion,
						timeout: options.timeout,
					},
					index,
				);
			},
		};
	}

	/**
	 * 构建实体创建操作（POST，自动处理 NONCE、Batching + Timeout）
	 */
	static createEntityCreateOperate(config: IEntityCreateOperateConfig): ResourceOperations {
		const bodyParamName = config.bodyParamName ?? 'body';
		const hasFields = Boolean(config.fields && config.fields.length > 0);
		const includeJsonBody = config.includeJsonBody ?? true;

		const properties: INodeProperties[] = [
			...(config.extraProperties ?? []),
			...(config.fields ?? []),
		];

		if (includeJsonBody) {
			properties.push({
				displayName:
					config.bodyDisplayName ?? (hasFields ? 'Additional Fields (JSON)' : 'Body (JSON)'),
				name: bodyParamName,
				type: 'json',
				required: config.bodyRequired ?? !hasFields,
				default: '{}',
				description: config.bodyDescription ?? FieldDescriptions.jsonBody,
				hint: FieldHints.jsonBody,
			});
		}

		properties.push(
			createCommonOptions([
				apiVersionOption,
				skipNonceOption,
				manualNonceOption,
				...(config.extraOptions ?? []),
			]),
		);

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const url = await resolvePath(this, config.path, index);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

				let body: IDataObject;
				if (config.buildBody) {
					body = await config.buildBody.call(this, index);
				} else {
					const fieldPayload = collectFieldsPayload(this, config.fields, index);
					const jsonPayload = includeJsonBody
						? NodeUtils.getNodeJsonData<IDataObject>(this, bodyParamName, index, {})
						: {};
					body = { ...fieldPayload, ...jsonPayload };
				}

				return RequestUtils.request.call(
					this,
					{
						method: 'POST',
						url,
						body,
						apiVersion: options.apiVersion,
						skipNonce: options.skipNonce,
						manualNonce: options.manualNonce,
						timeout: options.timeout,
					},
					index,
				);
			},
		};
	}

	/**
	 * 构建实体更新操作（PATCH/PUT，自动处理 NONCE、Batching + Timeout）
	 */
	static createEntityUpdateOperate(config: IEntityUpdateOperateConfig): ResourceOperations {
		const bodyParamName = config.bodyParamName ?? 'body';
		const hasFields = Boolean(config.fields && config.fields.length > 0);
		const includeJsonBody = config.includeJsonBody ?? true;
		const method = config.method ?? 'PATCH';

		const properties: INodeProperties[] = [];
		if (config.idParam !== false) {
			properties.push(buildIdProperty(config.idParam));
		}
		properties.push(...(config.extraProperties ?? []), ...(config.fields ?? []));

		if (includeJsonBody) {
			properties.push({
				displayName:
					config.bodyDisplayName ?? (hasFields ? 'Additional Fields (JSON)' : 'Body (JSON)'),
				name: bodyParamName,
				type: 'json',
				required: config.bodyRequired ?? !hasFields,
				default: '{}',
				description: config.bodyDescription ?? FieldDescriptions.jsonBodyUpdate,
				hint: FieldHints.jsonBody,
			});
		}

		properties.push(
			createCommonOptions([
				apiVersionOption,
				skipNonceOption,
				manualNonceOption,
				...(config.extraOptions ?? []),
			]),
		);

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const { url, id } = await resolveEntityOrMemberUrl(
					this,
					config.path,
					index,
					config.idParam,
				);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

				let body: IDataObject;
				if (config.buildBody) {
					body = await config.buildBody.call(this, index);
				} else {
					const fieldPayload = collectFieldsPayload(this, config.fields, index);
					const jsonPayload = includeJsonBody
						? NodeUtils.getNodeJsonData<IDataObject>(this, bodyParamName, index, {})
						: {};
					body = { ...fieldPayload, ...jsonPayload };
				}

				const res = await RequestUtils.request.call(
					this,
					{
						method,
						url,
						body,
						apiVersion: options.apiVersion,
						skipNonce: options.skipNonce,
						manualNonce: options.manualNonce,
						timeout: options.timeout,
					},
					index,
				);

				if (res === undefined || res === null || res === '') {
					return { success: true, ...(id ? { id } : {}) };
				}
				return res;
			},
		};
	}

	/**
	 * 构建实体删除操作（DELETE，自动处理 NONCE、Batching + Timeout）
	 */
	static createEntityDeleteOperate(config: IEntityDeleteOperateConfig): ResourceOperations {
		const properties: INodeProperties[] = [];
		if (config.idParam !== false) {
			properties.push(buildIdProperty(config.idParam));
		}
		properties.push(...(config.extraProperties ?? []));
		properties.push(
			createCommonOptions([
				apiVersionOption,
				skipNonceOption,
				manualNonceOption,
				...(config.extraOptions ?? []),
			]),
		);

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const { url, id } = await resolveEntityOrMemberUrl(
					this,
					config.path,
					index,
					config.idParam,
				);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

				const res = await RequestUtils.request.call(
					this,
					{
						method: 'DELETE',
						url,
						apiVersion: options.apiVersion,
						skipNonce: options.skipNonce,
						manualNonce: options.manualNonce,
						timeout: options.timeout,
					},
					index,
				);

				if (res === undefined || res === null || res === '') {
					return { deleted: true, ...(id ? { id } : {}) };
				}
				return res;
			},
		};
	}

	/**
	 * 构建 OData Function 调用操作（GET，支持绑定/非绑定函数以及可选分页）
	 */
	static createFunctionOperate(config: IFunctionOperateConfig): ResourceOperations {
		const properties: INodeProperties[] = [];
		if (config.idParam !== undefined && config.idParam !== false) {
			properties.push(buildIdProperty(config.idParam));
		}
		properties.push(...(config.params ?? []), ...(config.extraProperties ?? []));

		if (config.paginated) {
			properties.push(
				paginationOptions.returnAll,
				paginationOptions.limit(config.maxLimit ?? 1000, 1, config.defaultLimit ?? 50),
			);
		}

		const odataOpts: INodeProperties[] = [odataSelectOption, odataExpandOption];
		if (config.paginated) {
			odataOpts.push(odataFilterOption, odataOrderByOption, odataCountOption);
		}
		odataOpts.push(apiVersionOption, ...(config.extraOptions ?? []));

		properties.push(createCommonOptions(odataOpts));

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const { url } = await resolveEntityOrMemberUrl(
					this,
					config.path,
					index,
					config.idParam ?? false,
					config.functionName,
				);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
				const { qs, headers } = ODataUtils.buildODataQueryAndHeaders(options);

				if (config.buildQuery) {
					Object.assign(qs, await config.buildQuery.call(this, index));
				}

				if (config.paginated) {
					const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
					const limit = returnAll
						? undefined
						: (this.getNodeParameter('limit', index, 50) as number);

					return ODataUtils.executePaginatedQuery.call(
						this,
						{
							url,
							returnAll,
							limit,
							qs,
							headers,
							pageSize: config.pageSize,
							apiVersion: options.apiVersion,
							timeout: options.timeout,
						},
						index,
					);
				}

				return RequestUtils.request.call(
					this,
					{
						method: 'GET',
						url,
						qs,
						headers,
						apiVersion: options.apiVersion,
						timeout: options.timeout,
					},
					index,
				);
			},
		};
	}

	/**
	 * 构建 OData Action 调用操作（POST，支持绑定/非绑定动作、自动 NONCE、Batching + Timeout）
	 */
	static createActionOperate(config: IActionOperateConfig): ResourceOperations {
		const bodyParamName = config.bodyParamName ?? 'body';
		const hasFields = Boolean(config.fields && config.fields.length > 0);
		const includeJsonBody = config.includeJsonBody ?? !hasFields;

		const properties: INodeProperties[] = [];
		if (config.idParam !== undefined && config.idParam !== false) {
			properties.push(buildIdProperty(config.idParam));
		}
		properties.push(...(config.extraProperties ?? []), ...(config.fields ?? []));

		if (includeJsonBody) {
			properties.push({
				displayName:
					config.bodyDisplayName ?? (hasFields ? 'Additional Parameters (JSON)' : 'Body (JSON)'),
				name: bodyParamName,
				type: 'json',
				required: config.bodyRequired ?? false,
				default: '{}',
				description: config.bodyDescription ?? FieldDescriptions.jsonBodyAction,
				hint: FieldHints.jsonBody,
			});
		}

		properties.push(
			createCommonOptions([
				apiVersionOption,
				skipNonceOption,
				manualNonceOption,
				...(config.extraOptions ?? []),
			]),
		);

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const { url } = await resolveEntityOrMemberUrl(
					this,
					config.path,
					index,
					config.idParam ?? false,
					config.actionName,
				);
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

				let body: IDataObject;
				if (config.buildBody) {
					body = await config.buildBody.call(this, index);
				} else {
					const fieldPayload = collectFieldsPayload(this, config.fields, index);
					const jsonPayload = includeJsonBody
						? NodeUtils.getNodeJsonData<IDataObject>(this, bodyParamName, index, {})
						: {};
					body = { ...fieldPayload, ...jsonPayload };
				}

				const res = await RequestUtils.request.call(
					this,
					{
						method: 'POST',
						url,
						body,
						apiVersion: options.apiVersion,
						skipNonce: options.skipNonce,
						manualNonce: options.manualNonce,
						timeout: options.timeout,
					},
					index,
				);

				if (res === undefined || res === null || res === '') {
					return { success: true };
				}
				return res;
			},
		};
	}

	/**
	 * 构建二进制文件下载操作（返回 OutputType.Binary 结构）
	 */
	static createBinaryDownloadOperate(config: IBinaryDownloadOperateConfig): ResourceOperations {
		const properties: INodeProperties[] = [];
		if (config.idParam !== false) {
			properties.push(buildIdProperty(config.idParam));
		}
		properties.push(...(config.extraProperties ?? []), binaryPropertyNameOption);
		properties.push(
			createCommonOptions([
				fileNameOption,
				mimeTypeOption,
				apiVersionOption,
				...(config.extraOptions ?? []),
			]),
		);

		return {
			name: config.name,
			value: config.value,
			description: config.description,
			action: config.action ?? config.name,
			order: config.order ?? 100,
			options: properties,
			async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
				const { url, id } = await resolveEntityOrMemberUrl(
					this,
					config.path,
					index,
					config.idParam,
					config.subPath,
				);
				const binaryPropertyName = this.getNodeParameter(
					'binaryPropertyName',
					index,
					'data',
				) as string;
				const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

				const fullResponse = await RequestUtils.request.call(
					this,
					{
						method: 'GET',
						url,
						encoding: 'arraybuffer',
						json: false,
						returnFullResponse: true,
						apiVersion: options.apiVersion,
						timeout: options.timeout,
					},
					index,
				);

				const responseHeaders = (fullResponse?.headers ?? {}) as Record<string, string>;
				const rawBody = fullResponse?.body ?? fullResponse;
				const buffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody as ArrayBuffer);

				const contentDisposition =
					responseHeaders['content-disposition'] || responseHeaders['Content-Disposition'];
				const rawContentType = responseHeaders['content-type'] || responseHeaders['Content-Type'];

				const fileName =
					(typeof options.fileName === 'string' && options.fileName.trim()) ||
					parseFilenameFromContentDisposition(contentDisposition) ||
					config.defaultFileName ||
					'download';

				const headerMime = rawContentType ? rawContentType.split(';')[0].trim() : undefined;
				const mimeType =
					(typeof options.mimeType === 'string' && options.mimeType.trim()) ||
					headerMime ||
					config.defaultMimeType ||
					'application/octet-stream';

				const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, mimeType);

				return {
					outputType: OutputType.Binary,
					json: {
						...(id ? { id } : {}),
						fileName,
						mimeType,
						fileSize: buffer.length,
					},
					binary: {
						[binaryPropertyName]: binaryData,
					},
				};
			},
		};
	}
}

export default WindchillOperationFactory;
