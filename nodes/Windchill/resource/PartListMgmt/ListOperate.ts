import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolvePartsListEntitySetPath } from './shared/entitySets';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'partList:list',
	description: '分页查询 PartListMgmt 域实体列表（支持 Return All 与 Limit）',
	order: 10,
	extraProperties: createEntitySetProperties('PartLists'),
	path(this: IExecuteFunctions, index: number): string {
		return resolvePartsListEntitySetPath(this, index);
	},
});

export default ListOperate;
