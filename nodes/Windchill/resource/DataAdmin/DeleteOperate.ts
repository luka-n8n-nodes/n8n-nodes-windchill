import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildDataAdminEntitySetProperties, resolveDataAdminEntitySet } from './common/entitySets';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'dataAdmin:delete',
	description: '删除 DataAdmin 实体（例如 Folders）',
	order: 50,
	extraProperties: buildDataAdminEntitySetProperties('Folders'),
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.folder.SubFolder:12345',
		description: '要删除的 DataAdmin 实体唯一标识符（OID）',
	},
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolveDataAdminEntitySet(this, index, 'Folders');
		return `/DataAdmin/${entitySet}`;
	},
});

export default DeleteOperate;
