/**
 * Windchill REST Services (WRS) 官方协议常量
 * 参考：https://support.ptc.com/help/windchill_rest_services/
 */

/** CSRF 令牌函数路径（PTC Common 域） */
export const CSRF_TOKEN_PATH = '/PTC/GetCSRFToken()';

/** 写操作 CSRF 请求头名称（与 GetCSRFToken 返回的 NonceKey 一致） */
export const CSRF_NONCE_HEADER = 'CSRF_NONCE';

/** 分页默认每页条数 */
export const DEFAULT_PAGE_SIZE = 100;

/** Return All 最大页数保护，防止无限循环 / OOM */
export const MAX_PAGINATION_PAGES = 1000;

/** Windchill OData 域官方名称 */
export const WindchillDomains = {
	ProdMgmt: 'ProdMgmt',
	DocMgmt: 'DocMgmt',
	CADDocumentMgmt: 'CADDocumentMgmt',
	DynamicDocMgmt: 'DynamicDocMgmt',
	Visualization: 'Visualization',
	ClfStructure: 'ClfStructure',
	ProdPlatformMgmt: 'ProdPlatformMgmt',
	PartListMgmt: 'PartListMgmt',
	ChangeMgmt: 'ChangeMgmt',
	Workflow: 'Workflow',
	EventMgmt: 'EventMgmt',
	PrincipalMgmt: 'PrincipalMgmt',
	DataAdmin: 'DataAdmin',
	PTC: 'PTC',
	NavCriteria: 'NavCriteria',
} as const;

export type WindchillDomainName = (typeof WindchillDomains)[keyof typeof WindchillDomains];

/** 路径片段安全校验：仅允许字母数字、点、下划线、短横线 */
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;

/**
 * 校验并规范化单个路径片段（实体集名、导航属性、函数名等）
 */
export function assertSafePathSegment(segment: string, label = 'path segment'): string {
	const cleaned = String(segment || '')
		.trim()
		.replace(/^\/+|\/+$/g, '');
	if (!cleaned) {
		throw new Error(`${label} cannot be empty`);
	}
	if (cleaned.includes('..') || cleaned.includes('\\') || cleaned.includes('://')) {
		throw new Error(`${label} contains illegal characters: ${cleaned}`);
	}
	// 允许函数调用写法 FunctionName(...) 中的括号与逗号、等号、引号
	if (cleaned.includes('(')) {
		const fnName = cleaned.slice(0, cleaned.indexOf('('));
		if (!SAFE_PATH_SEGMENT.test(fnName)) {
			throw new Error(`${label} function name is invalid: ${fnName}`);
		}
		return cleaned;
	}
	for (const part of cleaned.split('/')) {
		if (!SAFE_PATH_SEGMENT.test(part)) {
			throw new Error(`${label} contains illegal characters: ${cleaned}`);
		}
	}
	return cleaned;
}
