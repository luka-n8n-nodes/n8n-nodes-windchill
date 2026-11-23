import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildDataAdminEntitySetProperties, resolveDataAdminEntitySet } from './common/entitySets';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'dataAdmin:create',
	description: '创建 DataAdmin 实体（例如 Folders）',
	order: 30,
	extraProperties: buildDataAdminEntitySetProperties('Folders'),
	bodyRequired: true,
	bodyDescription:
		'创建实体所需的 JSON 请求体（例如 Folders 常用 Name 与 ParentFolder@odata.bind / Cabinet@odata.bind）',
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolveDataAdminEntitySet(this, index, 'Folders');
		return `/DataAdmin/${entitySet}`;
	},
});

export default CreateOperate;
