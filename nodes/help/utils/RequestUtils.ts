import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { Credentials, WRITE_HTTP_METHODS } from '../type/enums';
import { ICommonOptionsValue } from './sharedOptions';
import { CSRF_NONCE_HEADER, CSRF_TOKEN_PATH } from './WindchillConstants';

export interface IWindchillRequestOptions extends IHttpRequestOptions {
	/** 覆盖凭证中的 apiVersion */
	apiVersion?: string;
	/** 跳过写操作自动获取 NONCE */
	skipNonce?: boolean;
	/** 手动指定 NONCE 值 */
	manualNonce?: string;
	/** 当前输入项索引，用于读取 node parameters 与错误定位 */
	itemIndex?: number;
	/**
	 * 显式传入的 CSRF 配置（优先于节点 options）
	 * 避免 HTTP 层再次隐式读取节点参数造成双通道
	 */
	csrfHeaderName?: string;
}

/** 单次 execute 作用域的 NONCE 缓存（挂在 context 上，避免模块级全局污染） */
const NONCE_CACHE_KEY = '__windchillNonceCache';

interface INonceCache {
	value?: string;
	inflight?: Promise<string>;
}

function getNonceCache(context: IExecuteFunctions): INonceCache {
	const ctx = context as IExecuteFunctions & { [NONCE_CACHE_KEY]?: INonceCache };
	if (!ctx[NONCE_CACHE_KEY]) {
		ctx[NONCE_CACHE_KEY] = {};
	}
	return ctx[NONCE_CACHE_KEY]!;
}

export function clearNonceCache(context: IExecuteFunctions): void {
	const ctx = context as IExecuteFunctions & { [NONCE_CACHE_KEY]?: INonceCache };
	delete ctx[NONCE_CACHE_KEY];
}

class RequestUtils {
	/**
	 * 标准化 baseURL（去除末尾斜杠）
	 */
	static normalizeBaseUrl(baseURL: string): string {
		return (baseURL || '').trim().replace(/\/+$/, '');
	}

	/**
	 * 标准化 apiVersion（去除首尾斜杠）
	 */
	static normalizeApiVersion(apiVersion?: string): string {
		return (apiVersion || '').trim().replace(/^\/+|\/+$/g, '');
	}

	/**
	 * 校验目标 URL 与凭证 baseURL 同源，防止凭证发往任意主机
	 */
	static assertSameOrigin(baseURL: string, absoluteUrl: string, itemIndex = 0): void {
		let allowedOrigin: string;
		let targetOrigin: string;
		try {
			allowedOrigin = new URL(RequestUtils.normalizeBaseUrl(baseURL)).origin;
			targetOrigin = new URL(absoluteUrl).origin;
		} catch {
			throw new Error(`Invalid URL for same-origin check: base=${baseURL}, url=${absoluteUrl}`);
		}
		if (allowedOrigin !== targetOrigin) {
			throw new Error(
				`Refusing to send Windchill credentials to a different origin. Allowed: ${allowedOrigin}, requested: ${targetOrigin}`,
			);
		}
	}

	/**
	 * 解析请求 URL，应用 baseURL 与可选 apiVersion
	 * - 若 url 已经是绝对 URL（例如 @odata.nextLink），校验同源后不修改 url 也不设置 baseURL
	 * - 若 url 以 /$batch 结尾或为域级 $batch，则不附加 apiVersion（由调用方决定）
	 * - 对 /$batch 根路径与 /{Domain}/$batch 均不重复附加 apiVersion 到错误位置
	 */
	static resolveRequestUrl(
		baseURL: string,
		url: string,
		apiVersion?: string,
		options?: { enforceSameOrigin?: boolean },
	): { baseURL?: string; url: string } {
		const rawUrl = (url || '').trim();
		const enforceSameOrigin = options?.enforceSameOrigin !== false;

		if (/^https?:\/\//i.test(rawUrl)) {
			if (enforceSameOrigin && baseURL) {
				RequestUtils.assertSameOrigin(baseURL, rawUrl);
			}
			return { baseURL: undefined, url: rawUrl };
		}

		const normalizedBase = RequestUtils.normalizeBaseUrl(baseURL);
		let normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;

		// 处理服务器根相对路径的 @odata.nextLink（已包含 baseURL 路径前缀）
		try {
			const parsedBase = new URL(normalizedBase);
			const basePath = parsedBase.pathname.replace(/\/+$/, '');
			if (
				basePath &&
				basePath !== '/' &&
				(normalizedPath === basePath ||
					normalizedPath.startsWith(`${basePath}/`) ||
					normalizedPath.startsWith(`${basePath}?`))
			) {
				return { baseURL: parsedBase.origin, url: normalizedPath };
			}
		} catch {
			// baseURL 不是完整 URL 时忽略
		}

		// $batch 路径不附加 apiVersion（根级或域级）
		const isBatchPath =
			normalizedPath === '/$batch' ||
			normalizedPath.startsWith('/$batch?') ||
			normalizedPath.startsWith('/$batch/') ||
			/\/\$batch(?:\?|$)/.test(normalizedPath);

		if (isBatchPath) {
			return { baseURL: normalizedBase, url: normalizedPath };
		}

		const version = RequestUtils.normalizeApiVersion(apiVersion);
		if (
			version &&
			!normalizedBase.endsWith(`/${version}`) &&
			normalizedPath !== `/${version}` &&
			!normalizedPath.startsWith(`/${version}/`) &&
			!normalizedPath.startsWith(`/${version}?`)
		) {
			normalizedPath = `/${version}${normalizedPath}`;
		}

		return { baseURL: normalizedBase, url: normalizedPath };
	}

	/**
	 * 从 GetCSRFToken 响应中提取 NONCE 字符串
	 */
	static extractNonceToken(res: unknown): string {
		if (typeof res === 'string') {
			const trimmed = res.trim();
			if (trimmed) return trimmed;
		}

		if (res && typeof res === 'object') {
			const obj = res as Record<string, unknown>;
			const candidate = obj.NonceValue ?? obj.value ?? obj.nonce ?? res;
			if (typeof candidate === 'string') {
				const trimmed = candidate.trim();
				if (trimmed) return trimmed;
			}
		}

		throw new Error('Failed to extract CSRF_NONCE from PTC/GetCSRFToken() response');
	}

	/**
	 * 从 GetCSRFToken 响应中提取请求头名称（默认 CSRF_NONCE）
	 */
	static extractNonceHeaderName(res: unknown): string {
		if (res && typeof res === 'object') {
			const key = (res as Record<string, unknown>).NonceKey;
			if (typeof key === 'string' && key.trim()) {
				return key.trim();
			}
		}
		return CSRF_NONCE_HEADER;
	}

	/**
	 * 从错误对象中提取 HTTP 状态码
	 */
	static getHttpStatusCode(error: unknown): number | undefined {
		if (!error || typeof error !== 'object') {
			return undefined;
		}
		const err = error as Record<string, any>;
		const raw =
			err.httpCode ??
			err.statusCode ??
			err.status ??
			err.response?.status ??
			err.response?.statusCode ??
			err.cause?.response?.status ??
			err.cause?.statusCode;

		if (raw === undefined || raw === null) {
			return undefined;
		}
		const num = Number(raw);
		return Number.isFinite(num) ? num : undefined;
	}

	/**
	 * 尝试解析 OData / HTTP 错误体并包装为 NodeApiError
	 */
	static wrapApiError(
		context: IExecuteFunctions,
		error: unknown,
		itemIndex = 0,
	): NodeApiError | NodeOperationError {
		if (error instanceof NodeApiError || error instanceof NodeOperationError) {
			return error;
		}

		const err = (error ?? {}) as Record<string, any>;
		const statusCode = RequestUtils.getHttpStatusCode(error);
		const rawData =
			err.context?.data ?? err.response?.data ?? err.response?.body ?? err.cause?.response?.data;

		let parsedData: Record<string, any> | undefined;

		if (rawData !== undefined && rawData !== null) {
			if (
				Buffer.isBuffer(rawData) ||
				rawData instanceof ArrayBuffer ||
				rawData instanceof Uint8Array
			) {
				const buf = Buffer.isBuffer(rawData) ? rawData : Buffer.from(rawData as ArrayBuffer);
				if (buf.length > 0) {
					const text = buf.toString('utf-8');
					try {
						parsedData = JSON.parse(text);
					} catch {
						parsedData = { message: text };
					}
				}
			} else if (typeof rawData === 'string') {
				try {
					parsedData = JSON.parse(rawData);
				} catch {
					parsedData = { message: rawData };
				}
			} else if (typeof rawData === 'object') {
				parsedData = rawData as Record<string, any>;
			}
		}

		const odataError = parsedData?.error as Record<string, any> | undefined;
		let message: string | undefined;
		let description: string | undefined;

		if (odataError) {
			const errCode = odataError.code ? `[${odataError.code}] ` : '';
			const errMsg =
				typeof odataError.message === 'string'
					? odataError.message
					: typeof odataError.message?.value === 'string'
						? odataError.message.value
						: JSON.stringify(odataError.message ?? odataError);
			message = `Windchill OData Error: ${errCode}${errMsg}`;

			if (Array.isArray(odataError.details) && odataError.details.length > 0) {
				description = odataError.details
					.map((d: any) => (typeof d?.message === 'string' ? d.message : JSON.stringify(d)))
					.join('; ');
			} else if (odataError.innererror?.message) {
				description = String(odataError.innererror.message);
			}
		} else if (typeof parsedData?.message === 'string' && parsedData.message) {
			message = `Windchill API Error: ${parsedData.message}`;
		}

		return new NodeApiError(context.getNode(), (error ?? {}) as JsonObject, {
			message,
			description,
			httpCode: statusCode !== undefined ? String(statusCode) : undefined,
			itemIndex,
		});
	}

	/**
	 * 将错误转为 continueOnFail 输出对象（含状态码与描述）
	 */
	static toErrorOutput(error: unknown): IDataObject {
		if (error instanceof NodeApiError) {
			return {
				error: error.message,
				...(error.httpCode ? { httpCode: error.httpCode } : {}),
				...(error.description ? { description: error.description } : {}),
			};
		}
		if (error instanceof Error) {
			const statusCode = RequestUtils.getHttpStatusCode(error);
			return {
				error: error.message,
				...(statusCode !== undefined ? { httpCode: String(statusCode) } : {}),
			};
		}
		return { error: String(error) };
	}

	/**
	 * 获取节点参数中的 options 对象（若当前操作未定义 options 则返回空对象）
	 */
	private static getNodeCommonOptions(
		context: IExecuteFunctions,
		itemIndex: number,
	): ICommonOptionsValue {
		try {
			return (context.getNodeParameter('options', itemIndex, {}) as ICommonOptionsValue) || {};
		} catch {
			return {};
		}
	}

	/**
	 * 底层发起单次 HTTP 请求（处理认证、URL/apiVersion、SSL、Timeout）
	 * Token / Basic 统一走 httpRequestWithAuthentication，由凭证 authenticate 注入请求头
	 */
	static async originRequest(
		this: IExecuteFunctions,
		options: IWindchillRequestOptions,
		itemIndex = 0,
	): Promise<any> {
		const authenticationMethod = this.getNodeParameter(
			'authentication',
			0,
			Credentials.WindchillBasicApi,
		) as string;

		const credentials = (await this.getCredentials(authenticationMethod, itemIndex)) as IDataObject;
		const credBaseUrl = (credentials.baseURL as string) || '';
		const credApiVersion = credentials.apiVersion as string | undefined;
		const effectiveApiVersion =
			options.apiVersion !== undefined ? options.apiVersion : credApiVersion;

		const resolved = RequestUtils.resolveRequestUrl(
			credBaseUrl,
			options.url || '',
			effectiveApiVersion,
		);

		const {
			apiVersion: _apiVersion,
			skipNonce: _skipNonce,
			manualNonce: _manualNonce,
			itemIndex: _itemIndex,
			csrfHeaderName: _csrfHeaderName,
			...httpOptions
		} = options;

		const headers: Record<string, string> = {};
		if (options.headers) {
			for (const [k, v] of Object.entries(options.headers)) {
				if (v !== undefined && v !== null) {
					headers[k] = String(v);
				}
			}
		}

		const requestOptions: IHttpRequestOptions = {
			...httpOptions,
			url: resolved.url,
			headers,
			skipSslCertificateValidation: Boolean(credentials.allowUnauthorizedCerts),
		};

		if (resolved.baseURL !== undefined) {
			requestOptions.baseURL = resolved.baseURL;
		} else {
			delete requestOptions.baseURL;
		}

		if (options.timeout && options.timeout > 0) {
			requestOptions.timeout = options.timeout;
		} else {
			delete requestOptions.timeout;
		}

		return this.helpers.httpRequestWithAuthentication.call(
			this,
			authenticationMethod,
			requestOptions,
		);
	}

	/**
	 * 获取 CSRF NONCE Token（带单次 execute 内缓存与 in-flight 去重）
	 */
	static async fetchNonceToken(
		this: IExecuteFunctions,
		itemIndex = 0,
		apiVersion?: string,
		timeout?: number,
		forceRefresh = false,
	): Promise<{ headerName: string; value: string }> {
		const cache = getNonceCache(this);

		if (!forceRefresh && cache.value) {
			return { headerName: CSRF_NONCE_HEADER, value: cache.value };
		}

		if (!forceRefresh && cache.inflight) {
			const value = await cache.inflight;
			return { headerName: CSRF_NONCE_HEADER, value };
		}

		const inflight = (async () => {
			const res = await RequestUtils.originRequest.call(
				this,
				{
					method: 'GET',
					url: CSRF_TOKEN_PATH,
					json: true,
					apiVersion,
					timeout,
				},
				itemIndex,
			);
			const value = RequestUtils.extractNonceToken(res);
			const headerName = RequestUtils.extractNonceHeaderName(res);
			cache.value = value;
			// 若服务器返回的 NonceKey 非默认，暂存到 value 旁通过闭包不够；调用方使用 headerName
			(cache as INonceCache & { headerName?: string }).headerName = headerName;
			return value;
		})();

		cache.inflight = inflight;
		try {
			const value = await inflight;
			const headerName =
				(cache as INonceCache & { headerName?: string }).headerName || CSRF_NONCE_HEADER;
			return { headerName, value };
		} finally {
			cache.inflight = undefined;
		}
	}

	/**
	 * 发送 Windchill API 请求
	 * - 自动处理 baseURL / apiVersion / SSL / Timeout / 凭证认证
	 * - 写操作自动注入 CSRF_NONCE，并在 HTTP 412 时刷新 NONCE 重试一次
	 * - 将 OData / HTTP 错误统一包装为 NodeApiError
	 */
	static async request(
		this: IExecuteFunctions,
		options: IWindchillRequestOptions,
		itemIndex?: number,
	): Promise<any> {
		const idx = itemIndex ?? options.itemIndex ?? 0;
		const nodeOptions = RequestUtils.getNodeCommonOptions(this, idx);

		const apiVersion =
			options.apiVersion !== undefined
				? options.apiVersion
				: (nodeOptions.apiVersion as string | undefined);
		const skipNonce =
			options.skipNonce !== undefined ? options.skipNonce : Boolean(nodeOptions.skipNonce);
		const manualNonce =
			options.manualNonce !== undefined
				? options.manualNonce
				: (nodeOptions.manualNonce as string | undefined);
		const timeout =
			options.timeout !== undefined
				? options.timeout
				: typeof nodeOptions.timeout === 'number'
					? nodeOptions.timeout
					: undefined;

		const method = (options.method || 'GET').toUpperCase();
		const isWriteMethod = WRITE_HTTP_METHODS.includes(method);
		const trimmedManualNonce = manualNonce?.trim() || '';

		const requestOptions: IWindchillRequestOptions = {
			...options,
			apiVersion,
			timeout,
			headers: { ...(options.headers ?? {}) },
		};

		if (requestOptions.json === undefined) {
			requestOptions.json = true;
		}

		try {
			if (isWriteMethod && !skipNonce) {
				if (trimmedManualNonce) {
					const headerName = options.csrfHeaderName || CSRF_NONCE_HEADER;
					requestOptions.headers = {
						...requestOptions.headers,
						[headerName]: trimmedManualNonce,
					};
				} else {
					const { headerName, value } = await RequestUtils.fetchNonceToken.call(
						this,
						idx,
						apiVersion,
						timeout,
						false,
					);
					requestOptions.headers = {
						...requestOptions.headers,
						[headerName]: value,
					};
				}
			}

			return await RequestUtils.originRequest.call(this, requestOptions, idx);
		} catch (error) {
			const statusCode = RequestUtils.getHttpStatusCode(error);
			if (statusCode === 412 && isWriteMethod && !skipNonce && !trimmedManualNonce) {
				try {
					clearNonceCache(this);
					const { headerName, value: refreshedNonce } = await RequestUtils.fetchNonceToken.call(
						this,
						idx,
						apiVersion,
						timeout,
						true,
					);
					const retryOptions: IWindchillRequestOptions = {
						...requestOptions,
						headers: {
							...requestOptions.headers,
							[headerName]: refreshedNonce,
						},
					};
					return await RequestUtils.originRequest.call(this, retryOptions, idx);
				} catch (retryError) {
					throw RequestUtils.wrapApiError(this, retryError, idx);
				}
			}

			throw RequestUtils.wrapApiError(this, error, idx);
		}
	}
}

export default RequestUtils;
