import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';

export const windchillDomainOptions = [
	{ name: 'ProdMgmt（产品管理）', value: 'ProdMgmt' },
	{ name: 'DocMgmt（文档管理）', value: 'DocMgmt' },
	{ name: 'CADDocumentMgmt（CAD 文档管理）', value: 'CADDocumentMgmt' },
	{ name: 'DynamicDocMgmt（动态文档管理）', value: 'DynamicDocMgmt' },
	{ name: 'Visualization（可视化）', value: 'Visualization' },
	{ name: 'ClfStructure（分类结构）', value: 'ClfStructure' },
	{ name: 'ProdPlatformMgmt（产品平台管理）', value: 'ProdPlatformMgmt' },
	{ name: 'PartListMgmt（零件清单管理）', value: 'PartListMgmt' },
	{ name: 'ChangeMgmt（变更管理）', value: 'ChangeMgmt' },
	{ name: 'Workflow（工作流）', value: 'Workflow' },
	{ name: 'EventMgmt（事件管理）', value: 'EventMgmt' },
	{ name: 'PrincipalMgmt（用户与组织管理）', value: 'PrincipalMgmt' },
	{ name: 'DataAdmin（数据管理）', value: 'DataAdmin' },
	{ name: 'PTC（公共域）', value: 'PTC' },
	{ name: 'NavCriteria（导航条件）', value: 'NavCriteria' },
	{ name: 'Custom（自定义域）', value: 'custom' },
];

export function buildDomainProperties(defaultValue = 'ProdMgmt'): INodeProperties[] {
	return [
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'options',
			required: true,
			default: defaultValue,
			options: windchillDomainOptions,
			description: '选择要查询的 Windchill OData 域',
			hint: '可用域列表见 OData 资源「Get Service Root」',
		},
		{
			displayName: 'Custom Domain',
			name: 'customDomain',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'ProdMgmt',
			displayOptions: {
				show: {
					domain: ['custom'],
				},
			},
			description: '自定义 Windchill OData 域名称',
			hint: '可用域列表见 OData 资源「Get Service Root」',
		},
	];
}

export function resolveDomain(
	context: IExecuteFunctions,
	index: number,
	defaultValue = 'ProdMgmt',
): string {
	const domain = String(context.getNodeParameter('domain', index, defaultValue) || '').trim();
	if (domain !== 'custom') {
		return domain;
	}
	const customDomain = String(context.getNodeParameter('customDomain', index, '') || '')
		.trim()
		.replace(/^\/+|\/+$/g, '');
	if (!customDomain) {
		throw new NodeOperationError(context.getNode(), 'Custom Domain cannot be empty', {
			itemIndex: index,
		});
	}
	return customDomain;
}
