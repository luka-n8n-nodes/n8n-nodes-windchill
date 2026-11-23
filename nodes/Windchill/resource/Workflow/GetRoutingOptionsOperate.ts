import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取路由选项 (Get Routing Options)',
	value: 'workflow:getRoutingOptions',
	order: 60,
	description: "获取指定工作项的路由选项 (WorkItems('{OID}')/PTC.Workflow.GetRoutingOptions)",
	idParam: {
		displayName: 'WorkItem ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作项 (WorkItem) 的 Windchill OID',
	},
	path: '/Workflow/WorkItems',
	functionName: 'PTC.Workflow.GetRoutingOptions',
	paginated: false,
});

export default operate;
