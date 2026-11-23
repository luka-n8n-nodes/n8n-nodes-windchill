import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';
import {
	odataCountOption,
	odataFilterOption,
	odataOrderByOption,
} from '../../../help/utils/sharedOptions';
import {
	createEntitySetProperties,
	resolveProductPlatformEntitySetPath,
} from './shared/entitySets';

const GetOperate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取详情 / 导航属性 (Get)',
	value: 'productPlatform:get',
	description:
		'根据 OID 获取单个 ProdPlatformMgmt 实体详情或其导航属性（Options、OptionGroups、Choices 等）',
	order: 20,
	idParam: false,
	extraProperties: [
		...createEntitySetProperties('OptionSets'),
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:com.ptc.windchill.option.model.OptionSet:12345',
			description: FieldDescriptions.oid,
			hint: FieldHints.oid,
		},
		{
			displayName: 'Navigation Property',
			name: 'navigationProperty',
			type: 'options',
			options: [
				{
					name: '可选项 (Choices)',
					value: 'Choices',
				},
				{
					name: '无（仅查询实体本身）',
					value: '',
				},
				{
					name: '自定义导航属性 (Custom)',
					value: 'custom',
				},
				{
					name: '选项 (Options)',
					value: 'Options',
				},
				{
					name: '选项组 (OptionGroups)',
					value: 'OptionGroups',
				},
			],
			default: '',
			description: FieldDescriptions.navigation,
			hint: FieldHints.navigation,
		},
		{
			displayName: 'Custom Navigation Property',
			name: 'customNavigationProperty',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'Options',
			displayOptions: {
				show: {
					navigationProperty: ['custom'],
				},
			},
			description: FieldDescriptions.customNavigation,
			hint: FieldHints.navigation,
		},
	],
	extraOptions: [odataFilterOption, odataOrderByOption, odataCountOption],
	path(this: IExecuteFunctions, index: number): string {
		const entitySetPath = resolveProductPlatformEntitySetPath(this, index);
		const id = String(this.getNodeParameter('id', index, '')).trim();
		if (!id) {
			throw new NodeOperationError(this.getNode(), 'ID cannot be empty', {
				itemIndex: index,
			});
		}

		const entityUrl = ODataUtils.buildEntityUrl(entitySetPath, id);
		const navProp = String(this.getNodeParameter('navigationProperty', index, '')).trim();
		if (!navProp) {
			return entityUrl;
		}

		const resolvedNav =
			navProp === 'custom'
				? String(this.getNodeParameter('customNavigationProperty', index, '')).trim()
				: navProp;

		if (!resolvedNav) {
			throw new NodeOperationError(this.getNode(), 'Custom Navigation Property cannot be empty', {
				itemIndex: index,
			});
		}

		return `${entityUrl}/${resolvedNav.replace(/^\/+/, '')}`;
	},
});

export default GetOperate;
