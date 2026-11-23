import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolveClassificationEntitySetPath } from './shared/entitySets';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'clfStructure:create',
	description: '在 ClfStructure 域中创建分类节点或分类实体',
	order: 30,
	extraProperties: createEntitySetProperties('ClassificationNodes'),
	includeJsonBody: true,
	bodyRequired: true,
	bodyDescription:
		'请求体 JSON 数据（例如分类节点的 Name、InternalName、Description、Parent 等字段）',
	path(this: IExecuteFunctions, index: number): string {
		return resolveClassificationEntitySetPath(this, index);
	},
});

export default CreateOperate;
