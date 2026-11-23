import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取工作项主题 (Get Subjects)',
	value: 'workflow:getSubjects',
	order: 70,
	description: "获取指定工作项的主题对象 (WorkItems('{OID}')/PTC.Workflow.GetSubjects)",
	idParam: {
		displayName: 'WorkItem ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作项 (WorkItem) 的 Windchill OID',
	},
	path: '/Workflow/WorkItems',
	functionName: 'PTC.Workflow.GetSubjects',
	paginated: false,
});

export default operate;
