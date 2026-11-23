import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildWorkflowEntitySetProperties, resolveWorkflowEntitySetPath } from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新工作流实体 (Update)',
	value: 'workflow:update',
	order: 40,
	description: '更新指定 OID 的工作项或工作流实体属性',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.workflow.work.WorkItem:12345',
		description: '待更新工作流实体的 Windchill OID',
	},
	extraProperties: buildWorkflowEntitySetProperties('WorkItems'),
	includeJsonBody: true,
	bodyRequired: true,
	bodyDescription: '需要更新的 JSON 字段数据',
	path(this: IExecuteFunctions, index: number) {
		return resolveWorkflowEntitySetPath(this, index, 'WorkItems');
	},
});

export default operate;
