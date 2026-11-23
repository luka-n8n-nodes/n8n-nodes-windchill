import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildWorkflowEntitySetProperties, resolveWorkflowEntitySetPath } from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取工作流详情 (Get)',
	value: 'workflow:get',
	order: 20,
	description: '根据 OID 获取 Workflow 域下单个实体的详细信息',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '工作流实体的 Windchill OID',
	},
	extraProperties: buildWorkflowEntitySetProperties('WorkItems'),
	path(this: IExecuteFunctions, index: number) {
		return resolveWorkflowEntitySetPath(this, index, 'WorkItems');
	},
});

export default operate;
