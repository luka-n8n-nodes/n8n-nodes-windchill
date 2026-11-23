import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '创建变更通知 (Create Change Notice)',
	value: 'changeMgmt:createChangeNotice',
	order: 70,
	description: '从指定变更请求创建变更通知 (PTC.ChangeMgmt.CreateChangeNotice)',
	idParam: {
		displayName: 'Change Request ID (OID)',
		placeholder: 'OR:wt.change2.WTChangeRequest2:12345',
		description: '源变更请求 (ChangeRequest) 的 Windchill OID',
	},
	path: '/ChangeMgmt/ChangeRequests',
	actionName: 'PTC.ChangeMgmt.CreateChangeNotice',
	fields: [
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			description: '可选变更通知名称',
		},
		{
			displayName: 'Description',
			name: 'Description',
			type: 'string',
			default: '',
			description: '可选变更通知描述',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription:
		'OData Action 请求体 JSON 参数（如 ChangeNotice 对象或其它扩展属性，将与上方字段合并）',
});

export default operate;
