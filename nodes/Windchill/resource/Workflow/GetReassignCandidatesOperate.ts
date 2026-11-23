import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取可重分配用户 (Get Reassign Candidates)',
	value: 'workflow:getReassignCandidates',
	order: 80,
	description:
		"获取指定工作项的可重分配候选用户列表 (WorkItems('{OID}')/PTC.Workflow.GetReassignCandidates)",
	idParam: {
		displayName: 'WorkItem ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作项 (WorkItem) 的 Windchill OID',
	},
	path: '/Workflow/WorkItems',
	functionName: 'PTC.Workflow.GetReassignCandidates',
	paginated: false,
});

export default operate;
