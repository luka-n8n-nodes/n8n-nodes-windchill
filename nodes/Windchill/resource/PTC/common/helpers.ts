import { IDataObject, IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from '../../../../help/utils/fieldHints';
import NodeUtils from '../../../../help/utils/NodeUtils';
import ODataUtils from '../../../../help/utils/ODataUtils';

export const commonEntitySetOptions = [
	{ name: 'Enumerations（枚举）', value: 'Enumerations' },
	{ name: 'NonceTokens（NONCE 令牌）', value: 'NonceTokens' },
	{ name: 'LocalizedValues（本地化值）', value: 'LocalizedValues' },
	{ name: 'Custom（自定义实体集）', value: 'custom' },
];

export function buildCommonEntitySetProperties(defaultValue = 'Enumerations'): INodeProperties[] {
	return [
		{
			displayName: 'Entity Set',
			name: 'entitySet',
			type: 'options',
			required: true,
			default: defaultValue,
			options: commonEntitySetOptions,
			description: FieldDescriptions.entitySet('PTC'),
			hint: FieldHints.entitySet,
		},
		{
			displayName: 'Custom Entity Set',
			name: 'customEntitySet',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'Enumerations',
			displayOptions: {
				show: {
					entitySet: ['custom'],
				},
			},
			description: FieldDescriptions.customEntitySet('PTC'),
			hint: FieldHints.entitySet,
		},
	];
}

export function resolveCommonEntitySet(
	context: IExecuteFunctions,
	index: number,
	defaultValue = 'Enumerations',
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

export function getJsonObjectParam(
	context: IExecuteFunctions,
	paramName: string,
	index: number,
): IDataObject {
	const parsed = NodeUtils.getNodeJsonData<unknown>(context, paramName, index, {});
	if (parsed === undefined || parsed === null) {
		return {};
	}
	if (typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new NodeOperationError(context.getNode(), `${paramName} must be a JSON object`, {
			itemIndex: index,
		});
	}
	return parsed as IDataObject;
}

export function formatODataFunctionCall(baseFunctionPath: string, params: IDataObject): string {
	const entries = Object.entries(params).filter(([, value]) => value !== undefined);
	if (entries.length === 0) {
		return `${baseFunctionPath}()`;
	}

	const formatted = entries.map(([key, value]) => {
		if (value === null) {
			return `${key}=null`;
		}
		if (typeof value === 'number' || typeof value === 'boolean') {
			return `${key}=${String(value)}`;
		}
		const strVal = typeof value === 'string' ? value : JSON.stringify(value);
		return `${key}='${ODataUtils.encodeODataKey(strVal)}'`;
	});

	return `${baseFunctionPath}(${formatted.join(',')})`;
}
