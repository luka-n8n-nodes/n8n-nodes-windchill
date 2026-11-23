import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolveClassificationEntitySetPath } from './shared/entitySets';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'clfStructure:delete',
	description: '删除 ClfStructure 域中的分类节点或分类实体',
	order: 50,
	idParam: {
		displayName: 'ID',
		name: 'id',
		required: true,
		placeholder: 'OR:com.ptc.windchill.csm.cls.ClassificationNode:12345',
		description: '要删除的分类实体唯一标识符（OID）',
	},
	extraProperties: createEntitySetProperties('ClassificationNodes'),
	path(this: IExecuteFunctions, index: number): string {
		return resolveClassificationEntitySetPath(this, index);
	},
});

export default DeleteOperate;
