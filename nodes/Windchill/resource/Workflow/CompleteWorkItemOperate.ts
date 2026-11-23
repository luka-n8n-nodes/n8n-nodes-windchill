import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldHints } from '../../../help/utils/fieldHints';
import NodeUtils from '../../../help/utils/NodeUtils';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '完成工作项 (Complete Work Item)',
	value: 'workflow:completeWorkItem',
	order: 90,
	description:
		"完成指定工作项并提交路由选择与备注 (WorkItems('{OID}')/PTC.Workflow.CompleteWorkItem)",
	idParam: {
		displayName: 'WorkItem ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作项 (WorkItem) 的 Windchill OID',
	},
	path: '/Workflow/WorkItems',
	actionName: 'PTC.Workflow.CompleteWorkItem',
	fields: [
		{
			displayName: 'Routing Choice',
			name: 'routingChoice',
			type: 'string',
			default: '',
			placeholder: 'Approve',
			description:
				'路由选择名称（支持单个值、逗号分隔或 JSON 数组，将写入 SelectedRoutingOptions；留空则在下方 JSON Body 中自定义）',
			hint: FieldHints.routingOption,
		},
		{
			displayName: 'Comments',
			name: 'comments',
			type: 'string',
			default: '',
			description: '审批或完成工作项的备注信息（将写入 Comments）',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription:
		'附加 OData Action 请求体 JSON 参数（如 Variables、RoutingChoices 等，将与上方字段合并且覆盖同名字段）',
	buildBody(this: IExecuteFunctions, index: number): IDataObject {
		const routingChoiceRaw = String(this.getNodeParameter('routingChoice', index, '') || '').trim();
		const comments = String(this.getNodeParameter('comments', index, '') || '').trim();
		const jsonPayload = NodeUtils.getNodeJsonData<IDataObject>(this, 'body', index, {});

		const payload: IDataObject = {};
		if (routingChoiceRaw) {
			payload.SelectedRoutingOptions = NodeUtils.parseStringList(routingChoiceRaw, 'routingChoice');
		}
		if (comments) {
			payload.Comments = comments;
		}
		return { ...payload, ...jsonPayload };
	},
});

export default operate;
