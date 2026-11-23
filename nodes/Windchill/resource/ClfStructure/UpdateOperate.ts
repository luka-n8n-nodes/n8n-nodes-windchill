import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolveClassificationEntitySetPath } from './shared/entitySets';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新实体 (Update)',
	value: 'clfStructure:update',
	description: '更新 ClfStructure 域中的分类节点或分类实体',
	order: 40,
	method: 'PATCH',
	idParam: {
		displayName: 'ID',
		name: 'id',
		required: true,
		placeholder: 'OR:com.ptc.windchill.csm.cls.ClassificationNode:12345',
		description: '要更新的分类实体唯一标识符（OID）',
	},
	extraProperties: createEntitySetProperties('ClassificationNodes'),
	includeJsonBody: true,
	bodyRequired: true,
	path(this: IExecuteFunctions, index: number): string {
		return resolveClassificationEntitySetPath(this, index);
	},
});

export default UpdateOperate;
