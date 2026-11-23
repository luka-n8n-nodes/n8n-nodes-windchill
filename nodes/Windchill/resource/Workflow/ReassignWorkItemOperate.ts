import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldHints } from '../../../help/utils/fieldHints';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '重分配工作项 (Reassign Work Item)',
	value: 'workflow:reassignWorkItem',
	order: 110,
	description:
		"将工作项重新分配给指定用户 (WorkItems('{OID}')/PTC.Workflow.ReassignWorkItem)",
	idParam: {
		displayName: 'WorkItem ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作项 (WorkItem) 的 Windchill OID',
	},
	path: '/Workflow/WorkItems',
	actionName: 'PTC.Workflow.ReassignWorkItem',
	fields: [
		{
			displayName: 'New Assignee',
			name: 'NewAssignee',
			type: 'string',
			default: '',
			placeholder: 'OR:wt.org.WTUser:12345',
			description: '新处理人标识（用户 OID 或用户名；也可在下方 JSON Body 中自定义参数字段）',
			hint: FieldHints.userOid,
		},
		{
			displayName: 'Comments',
			name: 'Comments',
			type: 'string',
			default: '',
			description: '重分配原因或备注',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription: '附加 OData Action 请求体 JSON 参数（将与上方字段合并发送）',
});

export default operate;
