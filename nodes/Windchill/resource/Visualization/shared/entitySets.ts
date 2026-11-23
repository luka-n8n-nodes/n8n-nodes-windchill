import {
	IExecuteFunctions,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

export const visualizationEntitySetOptions: INodePropertyOptions[] = [
	{
		name: 'PVZ 文件 (PVZFiles)',
		value: 'PVZFiles',
	},
	{
		name: '表示 (Representations)',
		value: 'Representations',
	},
	{
		name: '缩略图 (Thumbnails)',
		value: 'Thumbnails',
	},
	{
		name: '小缩略图 (SmallThumbnails)',
		value: 'SmallThumbnails',
	},
	{
		name: '自定义实体集 (Custom)',
		value: 'custom',
	},
];

export function createEntitySetProperties(defaultValue = 'Representations'): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			options: visualizationEntitySetOptions,
			default: defaultValue,
			required: true,
			description: FieldDescriptions.entitySet('Visualization'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'Representations',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('Visualization'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolveVisualizationEntitySetPath(
	context: IExecuteFunctions,
	index: number,
): string {
	const entitySet = String(context.getNodeParameter('entitySet', index, 'Representations')).trim();
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
	if (clean.startsWith('Visualization/')) {
		return `/${clean}`;
	}
	return `/Visualization/${clean}`;
}
