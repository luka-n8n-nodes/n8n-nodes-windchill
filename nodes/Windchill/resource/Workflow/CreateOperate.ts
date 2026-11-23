import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildWorkflowEntitySetProperties, resolveWorkflowEntitySetPath } from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建工作流实体 (Create)',
	value: 'workflow:create',
	order: 30,
	description: '在 Workflow 域下创建工作流实体（如启动工作流流程）',
	extraProperties: buildWorkflowEntitySetProperties('WorkflowProcesses'),
	includeJsonBody: true,
	bodyRequired: true,
	bodyDescription: '请求体 JSON 数据（包含创建工作流实体所需的属性或 @odata.bind 关联）',
	path(this: IExecuteFunctions, index: number) {
		return resolveWorkflowEntitySetPath(this, index, 'WorkflowProcesses');
	},
});

export default operate;
