import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildDataAdminEntitySetProperties, resolveDataAdminEntitySet } from './common/entitySets';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新实体 (Update)',
	value: 'dataAdmin:update',
	description: '更新 DataAdmin 实体（例如 Folders）',
	order: 40,
	extraProperties: buildDataAdminEntitySetProperties('Folders'),
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.folder.SubFolder:12345',
		description: '要更新的 DataAdmin 实体唯一标识符（OID）',
	},
	bodyRequired: true,
	bodyDescription: '需要更新的实体属性 JSON 数据',
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolveDataAdminEntitySet(this, index, 'Folders');
		return `/DataAdmin/${entitySet}`;
	},
});

export default UpdateOperate;
