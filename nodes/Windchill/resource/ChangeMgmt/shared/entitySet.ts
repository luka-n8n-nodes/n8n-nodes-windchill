import { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

const CHANGE_MGMT_ENTITY_SETS: INodePropertyOptions[] = [
	{
		name: 'AffectedItems（受影响对象）',
		value: 'AffectedItems',
	},
	{
		name: 'ChangeActivities（变更活动）',
		value: 'ChangeActivities',
	},
	{
		name: 'ChangeContents（变更内容）',
		value: 'ChangeContents',
	},
	{
		name: 'ChangeIssues（变更问题）',
		value: 'ChangeIssues',
	},
	{
		name: 'ChangeNotices（变更通知）',
		value: 'ChangeNotices',
	},
	{
		name: 'ChangeRequests（变更请求）',
		value: 'ChangeRequests',
	},
	{
		name: '自定义 (Custom)',
		value: 'custom',
	},
];

export function buildChangeMgmtEntitySetProperties(
	defaultEntitySet = 'ChangeRequests',
): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			required: true,
			default: defaultEntitySet,
			options: CHANGE_MGMT_ENTITY_SETS,
			description: FieldDescriptions.entitySet('ChangeMgmt'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'ChangeRequests',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('ChangeMgmt'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolveChangeMgmtEntitySetPath(
	context: IExecuteFunctions,
	index: number,
	defaultEntitySet = 'ChangeRequests',
): string {
	const selected = String(
		context.getNodeParameter('entitySet', index, defaultEntitySet) || '',
	).trim();
	const entitySet =
		selected === 'custom'
			? String(context.getNodeParameter('customEntitySet', index, '') || '').trim()
			: selected;
	const cleanEntitySet = (entitySet || defaultEntitySet).replace(/^\/+|\/+$/g, '');
	return `/ChangeMgmt/${cleanEntitySet}`;
}
