import {
	IExecuteFunctions,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

export const DYNAMIC_DOC_ENTITY_SET_OPTIONS: INodePropertyOptions[] = [
	{ name: '动态文档 (DynamicDocuments)', value: 'DynamicDocuments' },
	{ name: '动态文档内容 (DynamicDocumentContents)', value: 'DynamicDocumentContents' },
	{ name: '附件 (Attachments)', value: 'Attachments' },
	{ name: '主内容 (PrimaryContents)', value: 'PrimaryContents' },
	{ name: '自定义实体集 (Custom)', value: 'custom' },
];

export const DYNAMIC_DOC_NAV_OPTIONS: INodePropertyOptions[] = [
	{ name: '无（获取实体本身）', value: '' },
	{ name: '主内容 (PrimaryContent)', value: 'PrimaryContent' },
	{ name: '附件 (Attachments)', value: 'Attachments' },
	{ name: '版本历史 (Versions)', value: 'Versions' },
	{ name: '主对象 (Master)', value: 'Master' },
	{ name: '自定义导航属性 (Custom)', value: 'custom' },
];

export function createDynamicDocEntitySetProperties(
	defaultValue = 'DynamicDocuments',
	extraShow?: Record<string, string[]>,
): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			options: DYNAMIC_DOC_ENTITY_SET_OPTIONS,
			default: defaultValue,
			required: true,
			...(extraShow ? { displayOptions: { show: extraShow } } : {}),
			description: FieldDescriptions.entitySet('DynamicDocMgmt'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'DynamicDocuments',
			displayOptions: {
				show: {
					...(extraShow ?? {}),
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('DynamicDocMgmt'),
			hint: FieldHints.entitySet,
		},
	];
}

export function createDynamicDocNavigationProperties(): INodeProperties[] {
	return [
		{
			displayName: 'Navigation Property',
			name: 'navigationProperty',
			type: 'options',
			options: DYNAMIC_DOC_NAV_OPTIONS,
			default: '',
			description: FieldDescriptions.navigation,
			hint: FieldHints.navigation,
		},
		{
			displayName: 'Custom Navigation Property',
			name: 'customNavigationProperty',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'PrimaryContent',
			displayOptions: {
				show: {
					navigationProperty: ['custom'],
				},
			},
			description: FieldDescriptions.customNavigation,
			hint: FieldHints.navigation,
		},
	];
}

export function resolveDynamicDocEntitySetPath(context: IExecuteFunctions, index: number): string {
	const entitySet = String(
		context.getNodeParameter('entitySet', index, 'DynamicDocuments') || '',
	).trim();
	if (entitySet === 'custom') {
		const custom = String(context.getNodeParameter('customEntitySet', index, '') || '')
			.trim()
			.replace(/^\/+|\/+$/g, '');
		if (!custom) {
			throw new NodeOperationError(context.getNode(), 'Custom Entity Set 不能为空', {
				itemIndex: index,
			});
		}
		return `/DynamicDocMgmt/${custom}`;
	}
	return `/DynamicDocMgmt/${entitySet}`;
}

export function resolveDynamicDocNavigation(context: IExecuteFunctions, index: number): string {
	const nav = String(context.getNodeParameter('navigationProperty', index, '') || '').trim();
	if (nav === 'custom') {
		const custom = String(context.getNodeParameter('customNavigationProperty', index, '') || '')
			.trim()
			.replace(/^\/+|\/+$/g, '');
		if (!custom) {
			throw new NodeOperationError(context.getNode(), 'Custom Navigation Property 不能为空', {
				itemIndex: index,
			});
		}
		return custom;
	}
	return nav;
}
