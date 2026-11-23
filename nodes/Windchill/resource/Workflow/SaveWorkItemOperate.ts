import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '保存工作项 (Save Work Item)',
	value: 'workflow:saveWorkItem',
	order: 100,
	description:
		"保存工作项的备注或变量而不完成任务 (WorkItems('{OID}')/PTC.Workflow.SaveWorkItem)",
	idParam: {
		displayName: 'WorkItem ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作项 (WorkItem) 的 Windchill OID',
	},
	path: '/Workflow/WorkItems',
	actionName: 'PTC.Workflow.SaveWorkItem',
	fields: [
		{
			displayName: 'Comments',
			name: 'Comments',
			type: 'string',
			default: '',
			description: '工作项备注信息',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription: '附加 OData Action 请求体 JSON 参数（如 Variables 等，将与 Comments 合并）',
});

export default operate;
