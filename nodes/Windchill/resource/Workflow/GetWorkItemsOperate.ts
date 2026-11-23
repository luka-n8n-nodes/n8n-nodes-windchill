import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取工作项列表 (Get Work Items)',
	value: 'workflow:getWorkItems',
	order: 50,
	description: '调用 PTC.Workflow.GetWorkItems 分页获取工作项列表（支持 Return All 与 Limit）',
	idParam: false,
	path: '/Workflow',
	functionName: 'PTC.Workflow.GetWorkItems',
	paginated: true,
});

export default operate;
