import crypto from 'crypto';
import { IDataObject, IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import RequestUtils from './RequestUtils';
import { ICommonOptionsValue } from './sharedOptions';
import { DEFAULT_PAGE_SIZE, MAX_PAGINATION_PAGES } from './WindchillConstants';

export interface IODataQueryAndHeaders {
	qs: IDataObject;
	headers: Record<string, string>;
}

export interface IPaginatedQueryParams {
	url: string;
	returnAll: boolean;
	limit?: number;
	qs?: IDataObject;
	headers?: Record<string, string>;
	pageSize?: number;
	apiVersion?: string;
	timeout?: number;
	/** 最大分页次数，默认 MAX_PAGINATION_PAGES */
	maxPages?: number;
	/**
	 * 是否在结果中保留 @odata.count
	 * 为 true 时返回 { value, count? } 结构；默认 false 仍返回扁平数组
	 */
	includeCountMeta?: boolean;
}

export interface IPaginatedQueryResult extends IDataObject {
	value: IDataObject[];
	count?: number;
	'@odata.count'?: number;
}

export interface IODataBatchRequestItem {
	method: IHttpRequestMethods;
	url: string;
	headers?: Record<string, string>;
	body?: IDataObject | string;
	contentId?: string;
}

export interface IODataBatchOptions {
	requests: IODataBatchRequestItem[];
	useChangeset?: boolean;
	apiVersion?: string;
	skipNonce?: boolean;
	manualNonce?: string;
	timeout?: number;
	/**
	 * 批处理域路径，WRS 官方为域级 /$batch，例如 ProdMgmt
	 * 留空则使用根路径 /$batch（兼容兜底）
	 */
	domain?: string;
}

export interface IODataBatchResponseItem {
	statusCode: number;
	statusText: string;
	contentId?: string;
	headers: Record<string, string>;
	body: unknown;
}

export interface IODataBatchResult extends IDataObject {
	responses: IODataBatchResponseItem[];
	total: number;
}

class ODataUtils {
	/**
	 * 转义 OData 字符串主键中的单引号并安全编码
	 */
	static encodeODataKey(key: string): string {
		const escaped = String(key).replace(/'/g, "''");
		return encodeURIComponent(escaped).replace(/%3A/gi, ':');
	}

	/**
	 * 构建 OData 单实体路径，例如 /ProdMgmt/Parts('OR:wt.part.WTPart:123')
	 * 以括号包裹的 ID 必须是安全的 key 形式，不允许任意路径注入
	 */
	static buildEntityUrl(entitySetPath: string, id: string): string {
		const trimmedPath = entitySetPath.replace(/\/+$/, '');
		const trimmedId = String(id).trim();
		if (!trimmedId) {
			throw new Error('OData entity key cannot be empty');
		}
		if (trimmedId.includes('/') || trimmedId.includes('..') || trimmedId.includes('\\')) {
			throw new Error(`Invalid OData entity key: ${trimmedId}`);
		}
		if (trimmedId.startsWith('(') && trimmedId.endsWith(')')) {
			return `${trimmedPath}${trimmedId}`;
		}
		return `${trimmedPath}('${ODataUtils.encodeODataKey(trimmedId)}')`;
	}

	/**
	 * 从操作 options 中构建 OData 查询参数和请求头
	 */
	static buildODataQueryAndHeaders(
		options: ICommonOptionsValue | IDataObject = {},
	): IODataQueryAndHeaders {
		const qs: IDataObject = {};
		const headers: Record<string, string> = {};

		const filter = options.filter ?? options.$filter;
		if (typeof filter === 'string' && filter.trim()) {
			qs.$filter = filter.trim();
		}

		const select = options.select ?? options.$select;
		if (Array.isArray(select) && select.length > 0) {
			qs.$select = select
				.map((s) => String(s).trim())
				.filter(Boolean)
				.join(',');
		} else if (typeof select === 'string' && select.trim()) {
			qs.$select = select.trim();
		}

		const expand = options.expand ?? options.$expand;
		if (Array.isArray(expand) && expand.length > 0) {
			qs.$expand = expand
				.map((s) => String(s).trim())
				.filter(Boolean)
				.join(',');
		} else if (typeof expand === 'string' && expand.trim()) {
			qs.$expand = expand.trim();
		}

		const orderby = options.orderby ?? options.$orderby;
		if (typeof orderby === 'string' && orderby.trim()) {
			qs.$orderby = orderby.trim();
		}

		const count = options.count ?? options.$count;
		if (count === true || count === 'true') {
			qs.$count = 'true';
		}

		const latestVersion = options.latestVersion ?? options['ptc.search.latestversion'];
		if (latestVersion === true || latestVersion === 'true') {
			qs['ptc.search.latestversion'] = 'true';
		}

		const wildcardSearch = options.wildcardSearch ?? options['PTC-WildcardSearch'];
		if (wildcardSearch === true || wildcardSearch === 'true') {
			headers['PTC-WildcardSearch'] = 'true';
		} else if (typeof wildcardSearch === 'string' && wildcardSearch.trim()) {
			headers['PTC-WildcardSearch'] = wildcardSearch.trim();
		}

		return { qs, headers };
	}

	/**
	 * 统一 OData 分页查询实现（支持 Return All 与 Limit）
	 * - 每页默认 pageSize = 100
	 * - 优先跟随响应中的 @odata.nextLink；否则按 $top / $skip 递增分页
	 * - 返回展平的 IDataObject[]；includeCountMeta 时返回 { value, count? }
	 * - maxPages 防止无限循环
	 */
	static async executePaginatedQuery(
		this: IExecuteFunctions,
		params: IPaginatedQueryParams,
		itemIndex = 0,
	): Promise<IDataObject[] | IDataObject> {
		const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
		const returnAll = Boolean(params.returnAll);
		const limit = params.limit ?? 50;
		const maxPages = params.maxPages ?? MAX_PAGINATION_PAGES;

		if (!returnAll && limit <= 0) {
			return params.includeCountMeta ? { value: [] } : [];
		}

		const results: IDataObject[] = [];
		const baseQs: IDataObject = { ...(params.qs ?? {}) };
		let currentTop = returnAll ? pageSize : Math.min(limit, pageSize);
		let skip = 0;
		let pageCount = 0;
		let odataCount: number | undefined;

		let currentUrl = params.url;
		let currentQs: IDataObject | undefined = {
			...baseQs,
			$top: currentTop,
		};

		while (true) {
			pageCount += 1;
			if (pageCount > maxPages) {
				throw new Error(
					`Pagination exceeded max pages (${maxPages}). Refine $filter or raise the limit.`,
				);
			}

			const response = await RequestUtils.request.call(
				this,
				{
					method: 'GET',
					url: currentUrl,
					qs: currentQs,
					headers: params.headers,
					apiVersion: params.apiVersion,
					timeout: params.timeout,
				},
				itemIndex,
			);

			let pageItems: IDataObject[] = [];
			if (Array.isArray(response)) {
				pageItems = response as IDataObject[];
			} else if (response && typeof response === 'object' && Array.isArray(response.value)) {
				pageItems = response.value as IDataObject[];
				if (odataCount === undefined) {
					const rawCount = response['@odata.count'] ?? response['odata.count'];
					if (typeof rawCount === 'number') {
						odataCount = rawCount;
					} else if (typeof rawCount === 'string' && rawCount.trim() !== '') {
						const parsed = Number(rawCount);
						if (Number.isFinite(parsed)) {
							odataCount = parsed;
						}
					}
				}
			} else if (response !== undefined && response !== null) {
				// 非集合响应：单实体或标量，直接包装为单元素结果并结束
				if (!Array.isArray(response) && typeof response === 'object') {
					results.push(response as IDataObject);
				}
				break;
			}

			results.push(...pageItems);

			if (!returnAll && results.length >= limit) {
				break;
			}

			const nextLink =
				response && typeof response === 'object' && typeof response['@odata.nextLink'] === 'string'
					? (response['@odata.nextLink'] as string).trim()
					: '';

			if (nextLink) {
				currentUrl = nextLink;
				currentQs = undefined;
				continue;
			}

			if (pageItems.length === 0 || pageItems.length < currentTop) {
				break;
			}

			skip += pageItems.length;
			const remaining = returnAll ? pageSize : Math.min(pageSize, limit - results.length);
			if (remaining <= 0) {
				break;
			}

			currentTop = remaining;
			currentUrl = params.url;
			currentQs = {
				...baseQs,
				$top: currentTop,
				$skip: skip,
			};
		}

		const sliced = returnAll ? results : results.slice(0, limit);
		const wantCountMeta = params.includeCountMeta || baseQs.$count === 'true';

		if (wantCountMeta) {
			return {
				value: sliced,
				...(odataCount !== undefined ? { '@odata.count': odataCount, count: odataCount } : {}),
			};
		}

		return sliced;
	}

	/**
	 * 序列化单条子请求为 application/http 文本段
	 */
	private static serializeHttpPart(item: IODataBatchRequestItem): string {
		const method = (item.method || 'GET').toUpperCase();
		const relativeUrl = item.url.startsWith('/') ? item.url.slice(1) : item.url;
		const lines: string[] = [];

		lines.push('Content-Type: application/http');
		lines.push('Content-Transfer-Encoding: binary');
		if (item.contentId) {
			lines.push(`Content-ID: ${item.contentId}`);
		}
		lines.push('');
		lines.push(`${method} ${relativeUrl} HTTP/1.1`);

		const headers: Record<string, string> = {
			Accept: 'application/json',
			...(item.headers ?? {}),
		};

		let bodyStr = '';
		if (item.body !== undefined && item.body !== null && method !== 'GET' && method !== 'DELETE') {
			bodyStr = typeof item.body === 'string' ? item.body : JSON.stringify(item.body);
			if (!Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
				headers['Content-Type'] = 'application/json';
			}
		}

		for (const [k, v] of Object.entries(headers)) {
			lines.push(`${k}: ${v}`);
		}

		lines.push('');
		if (bodyStr) {
			lines.push(bodyStr);
		}

		return lines.join('\r\n');
	}

	/**
	 * 解析 multipart/mixed $batch 响应体
	 */
	private static parseMultipartBatchResponse(
		rawBody: string,
		contentTypeHeader?: string,
	): IODataBatchResponseItem[] {
		let boundary = '';
		if (contentTypeHeader) {
			const match = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
			if (match) {
				boundary = match[1] || match[2] || '';
			}
		}

		if (!boundary) {
			const firstLineMatch = rawBody.match(/^--([^\r\n]+)/m);
			if (firstLineMatch) {
				boundary = firstLineMatch[1].replace(/--$/, '');
			}
		}

		if (!boundary) {
			return [
				{
					statusCode: 200,
					statusText: 'OK',
					headers: {},
					body: rawBody,
				},
			];
		}

		const delimiter = `--${boundary}`;
		const rawParts = rawBody.split(delimiter);
		const results: IODataBatchResponseItem[] = [];

		for (const rawPart of rawParts) {
			const trimmed = rawPart.trim();
			if (!trimmed || trimmed === '--') {
				continue;
			}

			const normalizedPart = rawPart.replace(/^\r?\n/, '').replace(/\r?\n$/, '');
			const outerSepMatch = normalizedPart.match(/\r?\n\r?\n/);
			if (!outerSepMatch || outerSepMatch.index === undefined) {
				continue;
			}

			const outerHeadersText = normalizedPart.slice(0, outerSepMatch.index);
			const innerContent = normalizedPart.slice(outerSepMatch.index + outerSepMatch[0].length);

			const outerHeaders = ODataUtils.parseHeadersBlock(outerHeadersText);
			const outerContentType = outerHeaders['content-type'] || '';

			if (/multipart\/mixed/i.test(outerContentType)) {
				results.push(...ODataUtils.parseMultipartBatchResponse(innerContent, outerContentType));
				continue;
			}

			const innerLines = innerContent.split(/\r?\n/);
			const statusLine = innerLines[0] || '';
			const statusMatch = statusLine.match(/^HTTP\/\d+(?:\.\d+)?\s+(\d{3})\s*(.*)$/i);
			const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0;
			const statusText = statusMatch ? statusMatch[2].trim() : '';

			const afterStatus = innerLines.slice(1).join('\n');
			const innerSepMatch = afterStatus.match(/\n\n/);
			const innerHeadersText =
				innerSepMatch && innerSepMatch.index !== undefined
					? afterStatus.slice(0, innerSepMatch.index)
					: afterStatus;
			const bodyText =
				innerSepMatch && innerSepMatch.index !== undefined
					? afterStatus.slice(innerSepMatch.index + innerSepMatch[0].length).trim()
					: '';

			const innerHeaders = ODataUtils.parseHeadersBlock(innerHeadersText);
			const contentId = outerHeaders['content-id'] || innerHeaders['content-id'];

			let parsedBody: unknown = null;
			if (bodyText) {
				try {
					parsedBody = JSON.parse(bodyText);
				} catch {
					parsedBody = bodyText;
				}
			}

			results.push({
				statusCode,
				statusText,
				...(contentId ? { contentId } : {}),
				headers: innerHeaders,
				body: parsedBody,
			});
		}

		return results;
	}

	private static parseHeadersBlock(block: string): Record<string, string> {
		const headers: Record<string, string> = {};
		for (const line of block.split(/\r?\n/)) {
			const idx = line.indexOf(':');
			if (idx > 0) {
				const key = line.slice(0, idx).trim().toLowerCase();
				const val = line.slice(idx + 1).trim();
				headers[key] = val;
			}
		}
		return headers;
	}

	/**
	 * 执行 OData $batch (POST /{Domain}/$batch multipart/mixed) 请求
	 * WRS 官方示例为域级批处理，例如 POST /ProdMgmt/$batch
	 */
	static async executeODataBatch(
		this: IExecuteFunctions,
		options: IODataBatchOptions,
		itemIndex = 0,
	): Promise<IODataBatchResult> {
		const batchBoundary = `batch_${crypto.randomUUID()}`;
		const chunks: string[] = [];

		if (options.useChangeset) {
			const changesetBoundary = `changeset_${crypto.randomUUID()}`;
			chunks.push(`--${batchBoundary}`);
			chunks.push(`Content-Type: multipart/mixed; boundary=${changesetBoundary}`);
			chunks.push('');

			for (let i = 0; i < options.requests.length; i++) {
				const reqItem: IODataBatchRequestItem = {
					...options.requests[i],
					contentId: options.requests[i].contentId ?? String(i + 1),
				};
				chunks.push(`--${changesetBoundary}`);
				chunks.push(ODataUtils.serializeHttpPart(reqItem));
			}
			chunks.push(`--${changesetBoundary}--`);
		} else {
			for (const reqItem of options.requests) {
				chunks.push(`--${batchBoundary}`);
				chunks.push(ODataUtils.serializeHttpPart(reqItem));
			}
		}

		chunks.push(`--${batchBoundary}--`);
		chunks.push('');

		const payload = chunks.join('\r\n');
		const domain = (options.domain || '').trim().replace(/^\/+|\/+$/g, '');
		const batchUrl = domain ? `/${domain}/$batch` : '/$batch';

		const fullResponse = await RequestUtils.request.call(
			this,
			{
				method: 'POST',
				url: batchUrl,
				body: payload,
				headers: {
					'Content-Type': `multipart/mixed; boundary=${batchBoundary}`,
					Accept: 'multipart/mixed, application/json',
				},
				json: false,
				returnFullResponse: true,
				apiVersion: options.apiVersion,
				skipNonce: options.skipNonce,
				manualNonce: options.manualNonce,
				timeout: options.timeout,
			},
			itemIndex,
		);

		const responseHeaders = (fullResponse?.headers ?? {}) as Record<string, string>;
		const contentType = responseHeaders['content-type'] || responseHeaders['Content-Type'] || '';
		const rawBody = fullResponse?.body ?? fullResponse;

		let responses: IODataBatchResponseItem[];
		if (
			typeof rawBody === 'object' &&
			!Buffer.isBuffer(rawBody) &&
			Array.isArray(rawBody?.responses)
		) {
			responses = rawBody.responses as IODataBatchResponseItem[];
		} else {
			const bodyText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf-8') : String(rawBody ?? '');
			responses = ODataUtils.parseMultipartBatchResponse(bodyText, contentType);
		}

		return {
			responses,
			total: responses.length,
		};
	}
}

export default ODataUtils;
