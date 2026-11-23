import { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

const EVENT_MGMT_ENTITY_SETS: INodePropertyOptions[] = [
	{
		name: 'DeliveryChannels（投递通道）',
		value: 'DeliveryChannels',
	},
	{
		name: 'EventSubscriptions（事件订阅）',
		value: 'EventSubscriptions',
	},
	{
		name: 'EventTypes（事件类型）',
		value: 'EventTypes',
	},
	{
		name: '自定义 (Custom)',
		value: 'custom',
	},
];

export function buildEventMgmtEntitySetProperties(
	defaultEntitySet = 'EventSubscriptions',
): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			required: true,
			default: defaultEntitySet,
			options: EVENT_MGMT_ENTITY_SETS,
			description: FieldDescriptions.entitySet('EventMgmt'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'EventSubscriptions',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('EventMgmt'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolveEventMgmtEntitySetPath(
	context: IExecuteFunctions,
	index: number,
	defaultEntitySet = 'EventSubscriptions',
): string {
	const selected = String(
		context.getNodeParameter('entitySet', index, defaultEntitySet) || '',
	).trim();
	const entitySet =
		selected === 'custom'
			? String(context.getNodeParameter('customEntitySet', index, '') || '').trim()
			: selected;
	const cleanEntitySet = (entitySet || defaultEntitySet).replace(/^\/+|\/+$/g, '');
	return `/EventMgmt/${cleanEntitySet}`;
}
