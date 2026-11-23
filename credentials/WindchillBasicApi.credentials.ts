import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WindchillBasicApi implements ICredentialType {
	name = 'windchillBasicApi';

	displayName = 'Windchill Basic Auth API';

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
			displayName: 'Username',
			name: 'username',
			type: 'string',
			required: true,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
		},
		{
			displayName: 'Ignore SSL Issues',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			default: false,
			description: 'Whether to connect even if SSL certificate validation is not possible',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.baseURL.replace(/\\/+$/, "") + ($credentials.apiVersion ? "/" + $credentials.apiVersion.replace(/^\\/+|\\/+$/g, "") : "") + "/"}}',
			method: 'GET',
			skipSslCertificateValidation: '={{$credentials.allowUnauthorizedCerts}}',
		},
	};
}
