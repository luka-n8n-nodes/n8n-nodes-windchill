import {
	IExecuteFunctions,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

export const productPlatformEntitySetOptions: INodePropertyOptions[] = [
	{
		name: '可选项 (Choices)',
		value: 'Choices',
	},
	{
		name: '选项组 (OptionGroups)',
		value: 'OptionGroups',
	},
	{
		name: '选项 (Options)',
		value: 'Options',
	},
	{
		name: '选项集 (OptionSets)',
		value: 'OptionSets',
	},
	{
		name: '自定义实体集 (Custom)',
		value: 'custom',
	},
];

export function createEntitySetProperties(defaultValue = 'OptionSets'): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			options: productPlatformEntitySetOptions,
			default: defaultValue,
			required: true,
			description: FieldDescriptions.entitySet('ProdPlatformMgmt'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'OptionSets',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('ProdPlatformMgmt'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolveProductPlatformEntitySetPath(
	context: IExecuteFunctions,
	index: number,
): string {
	const entitySet = String(context.getNodeParameter('entitySet', index, 'OptionSets')).trim();
	const raw =
		entitySet === 'custom'
			? String(context.getNodeParameter('customEntitySet', index, '')).trim()
			: entitySet;

	if (!raw) {
		throw new NodeOperationError(context.getNode(), 'Entity Set cannot be empty', {
			itemIndex: index,
		});
	}

	const clean = raw.replace(/^\/+/, '');
	if (clean.startsWith('ProdPlatformMgmt/')) {
		return `/${clean}`;
	}
	return `/ProdPlatformMgmt/${clean}`;
}
