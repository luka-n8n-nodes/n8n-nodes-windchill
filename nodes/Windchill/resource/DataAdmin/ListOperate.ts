import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildDataAdminEntitySetProperties, resolveDataAdminEntitySet } from './common/entitySets';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'dataAdmin:list',
	description: '查询 DataAdmin 实体集列表（支持 Return All 与 Limit 分页）',
	order: 10,
	extraProperties: buildDataAdminEntitySetProperties('Folders'),
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolveDataAdminEntitySet(this, index, 'Folders');
		return `/DataAdmin/${entitySet}`;
	},
});

export default ListOperate;
