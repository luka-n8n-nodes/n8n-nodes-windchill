import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class WindchillTokenApi implements ICredentialType {
	name = 'windchillTokenApi';

	displayName = 'Windchill Token / Header API';

	icon = 'file:icon.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseURL',
			type: 'string',
			required: true,
			default: 'https://windchill.example.com/Windchill/servlet/odata',
			placeholder: 'https://windchill.example.com/Windchill/servlet/odata',
			hint: 'Windchill OData 根地址，例如 https://windchill.example.com/Windchill/servlet/odata',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: '',
			placeholder: 'v5',
			hint: '可选默认 API 版本（如 v5），留空使用服务器默认版本',
		},
		{
			displayName: 'Header Name',
			name: 'headerName',
			type: 'string',
			required: true,
			default: 'Authorization',
			placeholder: 'Authorization',
			description: '携带令牌或认证凭据的 HTTP 请求头名称',
		},
		// eslint-disable-next-line @n8n/community-nodes/credential-unnecessary-password
		{
			displayName: 'Header Value',
			name: 'headerValue',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			placeholder: 'Bearer {token}',
			description: 'HTTP 请求头的值，例如 Bearer {token}',
		},
		{
			displayName: 'Extra Headers (JSON)',
			name: 'extraHeaders',
			type: 'string',
			default: '',
			placeholder: '{"Cookie": "JSESSIONID=..."}',
			description: '可选附加请求头 JSON，例如 {"Cookie":"..."}',
		},
		{
			displayName: 'Ignore SSL Issues',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			default: false,
			description: 'Whether to connect even if SSL certificate validation is not possible',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.headers ??= {};

		const headerName = ((credentials.headerName as string) || 'Authorization').trim();
		const headerValue = (credentials.headerValue as string) ?? '';
		if (headerName && headerValue !== '') {
			requestOptions.headers[headerName] = headerValue;
		}

		const rawExtraHeaders = ((credentials.extraHeaders as string) || '').trim();
		if (rawExtraHeaders) {
			try {
				const parsed = JSON.parse(rawExtraHeaders) as Record<string, unknown>;
				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					for (const [key, value] of Object.entries(parsed)) {
						if (value !== undefined && value !== null) {
							requestOptions.headers[key] = String(value);
						}
					}
				}
			} catch (error) {
				throw new Error(
					`Extra Headers JSON 格式无效: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}

		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.baseURL.replace(/\\/+$/, "") + ($credentials.apiVersion ? "/" + $credentials.apiVersion.replace(/^\\/+|\\/+$/g, "") : "") + "/"}}',
			method: 'GET',
			skipSslCertificateValidation: '={{$credentials.allowUnauthorizedCerts}}',
		},
	};
}
