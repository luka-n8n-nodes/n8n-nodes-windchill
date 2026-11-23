import { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

const WORKFLOW_ENTITY_SETS: INodePropertyOptions[] = [
	{
		name: 'Activities（活动）',
		value: 'Activities',
	},
	{
		name: 'RoutingOptions（路由选项）',
		value: 'RoutingOptions',
	},
	{
		name: 'WorkflowProcesses（工作流流程）',
		value: 'WorkflowProcesses',
	},
	{
		name: 'WorkItems（工作项）',
		value: 'WorkItems',
	},
	{
		name: 'WorkItemSubjects（工作项主题对象）',
		value: 'WorkItemSubjects',
	},
	{
		name: '自定义 (Custom)',
		value: 'custom',
	},
];

export function buildWorkflowEntitySetProperties(
	defaultEntitySet = 'WorkItems',
): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			required: true,
			default: defaultEntitySet,
			options: WORKFLOW_ENTITY_SETS,
			description: FieldDescriptions.entitySet('Workflow'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'WorkItems',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('Workflow'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolveWorkflowEntitySetPath(
	context: IExecuteFunctions,
	index: number,
	defaultEntitySet = 'WorkItems',
): string {
	const selected = String(
		context.getNodeParameter('entitySet', index, defaultEntitySet) || '',
	).trim();
	const entitySet =
		selected === 'custom'
			? String(context.getNodeParameter('customEntitySet', index, '') || '').trim()
			: selected;
	const cleanEntitySet = (entitySet || defaultEntitySet).replace(/^\/+|\/+$/g, '');
	return `/Workflow/${cleanEntitySet}`;
}
