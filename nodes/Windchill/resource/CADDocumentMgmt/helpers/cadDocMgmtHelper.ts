import {
	IExecuteFunctions,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

export const CAD_ENTITY_SET_OPTIONS: INodePropertyOptions[] = [
	{ name: 'CAD 文档 (CADDocuments)', value: 'CADDocuments' },
	{ name: 'CAD 文档内容 (CADDocumentContents)', value: 'CADDocumentContents' },
	{ name: '部件文档关联 (PartDocAssociations)', value: 'PartDocAssociations' },
	{ name: 'CAD 装配 (CADAssemblies)', value: 'CADAssemblies' },
	{ name: 'CAD 组件 (CADComponents)', value: 'CADComponents' },
	{ name: '族表 (FamilyTables)', value: 'FamilyTables' },
	{ name: '族表实例 (FamilyTableInstances)', value: 'FamilyTableInstances' },
	{ name: '自定义实体集 (Custom)', value: 'custom' },
];

export const CAD_NAV_OPTIONS: INodePropertyOptions[] = [
	{ name: '无（获取实体本身）', value: '' },
	{ name: '部件文档关联 (PartDocAssociations)', value: 'PartDocAssociations' },
	{ name: '关联部件 (RelatedPart)', value: 'RelatedPart' },
	{ name: '装配结构 (Structure)', value: 'Structure' },
	{ name: '子组件 (Components)', value: 'Components' },
	{ name: '父件反查 (UsedBy)', value: 'UsedBy' },
	{ name: '自定义导航属性 (Custom)', value: 'custom' },
];

export function createCadEntitySetProperties(defaultValue = 'CADDocuments'): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			options: CAD_ENTITY_SET_OPTIONS,
			default: defaultValue,
			required: true,
			description: FieldDescriptions.entitySet('CADDocumentMgmt'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'CADDocuments',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('CADDocumentMgmt'),
			hint: FieldHints.entitySet,
		},
	];
}

export function createCadNavigationProperties(): INodeProperties[] {
	return [
		{
			displayName: 'Navigation Property',
			name: 'navigationProperty',
			type: 'options',
			options: CAD_NAV_OPTIONS,
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
			placeholder: 'PartDocAssociations',
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

export function resolveCadEntitySetPath(context: IExecuteFunctions, index: number): string {
	const entitySet = String(
		context.getNodeParameter('entitySet', index, 'CADDocuments') || '',
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
		return `/CADDocumentMgmt/${custom}`;
	}
	return `/CADDocumentMgmt/${entitySet}`;
}

export function resolveCadNavigation(context: IExecuteFunctions, index: number): string {
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
