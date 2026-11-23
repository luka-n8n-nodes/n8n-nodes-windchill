/**
 * 输出类型枚举
 */
export enum OutputType {
	Single = 'single',
	Multiple = 'multiple',
	None = 'none',
	PassThrough = 'passThrough',
	Binary = 'binary',
}

/**
 * 凭证类型枚举
 */
export enum Credentials {
	WindchillBasicApi = 'windchillBasicApi',
	WindchillTokenApi = 'windchillTokenApi',
}

/**
 * 需要 CSRF NONCE 校验的写操作 HTTP 方法
 */
export const WRITE_HTTP_METHODS: readonly string[] = ['POST', 'PATCH', 'PUT', 'DELETE'] as const;
