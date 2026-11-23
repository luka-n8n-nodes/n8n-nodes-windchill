import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildChangeMgmtEntitySetProperties,
	resolveChangeMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取变更详情 (Get)',
	value: 'changeMgmt:get',
	order: 20,
	description: '根据 OID 获取单个变更实体详情或其关联导航属性',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.change2.WTChangeRequest2:12345',
		description: '变更实体的 Windchill OID',
	},
	extraProperties: [
		...buildChangeMgmtEntitySetProperties('ChangeRequests'),
		{
			displayName: 'Navigation Property',
			name: 'navigationProperty',
			type: 'options',
			default: '',
			options: [
				{
					name: 'AffectedItems（受影响对象）',
					value: 'AffectedItems',
				},
				{
					name: 'ChangeActivities（变更活动）',
					value: 'ChangeActivities',
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
					name: '无（返回实体本身）',
					value: '',
				},
				{
					name: '自定义 (Custom)',
					value: 'custom',
				},
			],
			description: FieldDescriptions.navigation,
			hint: FieldHints.navigation,
		},
		{
			displayName: 'Custom Navigation Property',
			name: 'customNavigationProperty',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'AffectedItems',
			displayOptions: {
				show: {
					navigationProperty: ['custom'],
				},
			},
			description: FieldDescriptions.customNavigation,
			hint: FieldHints.navigation,
		},
	],
	path(this: IExecuteFunctions, index: number) {
		const basePath = resolveChangeMgmtEntitySetPath(this, index, 'ChangeRequests');
		const selectedNav = String(this.getNodeParameter('navigationProperty', index, '') || '').trim();
		const navProp =
			selectedNav === 'custom'
				? String(this.getNodeParameter('customNavigationProperty', index, '') || '').trim()
				: selectedNav;
		const cleanNav = navProp.replace(/^\/+|\/+$/g, '');
		return cleanNav ? `${basePath}('{id}')/${cleanNav}` : basePath;
	},
});

export default operate;
