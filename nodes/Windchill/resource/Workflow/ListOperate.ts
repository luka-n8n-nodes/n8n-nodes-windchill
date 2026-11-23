import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildWorkflowEntitySetProperties, resolveWorkflowEntitySetPath } from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '获取工作流列表 (List)',
	value: 'workflow:list',
	order: 10,
	description: '分页查询 Workflow 域下的实体集列表（支持 Return All 与 Limit）',
	extraProperties: buildWorkflowEntitySetProperties('WorkItems'),
	path(this: IExecuteFunctions, index: number) {
		return resolveWorkflowEntitySetPath(this, index, 'WorkItems');
	},
});

export default operate;
