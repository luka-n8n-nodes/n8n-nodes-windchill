import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';

export const principalMgmtEntitySetOptions = [
	{ name: 'Users（用户）', value: 'Users' },
	{ name: 'Groups（用户组）', value: 'Groups' },
	{ name: 'Organizations（组织）', value: 'Organizations' },
	{ name: 'Roles（角色）', value: 'Roles' },
	{ name: 'Teams（团队）', value: 'Teams' },
	{ name: 'TeamMembers（团队成员）', value: 'TeamMembers' },
	{ name: 'Custom（自定义实体集）', value: 'custom' },
];

export function buildPrincipalMgmtEntitySetProperties(defaultValue = 'Users'): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			required: true,
			default: defaultValue,
			options: principalMgmtEntitySetOptions,
			description: FieldDescriptions.entitySet('PrincipalMgmt'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'Users',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('PrincipalMgmt'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolvePrincipalMgmtEntitySet(
	context: IExecuteFunctions,
	index: number,
	defaultValue = 'Users',
): string {
	const entitySet = String(context.getNodeParameter('entitySet', index, defaultValue) || '').trim();
	if (entitySet !== 'custom') {
		return entitySet;
	}
	const customEntitySet = String(context.getNodeParameter('customEntitySet', index, '') || '')
		.trim()
		.replace(/^\/+|\/+$/g, '');
	if (!customEntitySet) {
		throw new NodeOperationError(context.getNode(), 'Custom Entity Set cannot be empty', {
			itemIndex: index,
		});
	}
	return customEntitySet;
}
