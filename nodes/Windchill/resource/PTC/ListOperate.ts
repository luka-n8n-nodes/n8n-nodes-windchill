import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { buildCommonEntitySetProperties, resolveCommonEntitySet } from './common/helpers';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'ptc:list',
	description: '查询 PTC 公共域实体集列表（支持 Return All 与 Limit 分页）',
	order: 10,
	extraProperties: buildCommonEntitySetProperties('Enumerations'),
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolveCommonEntitySet(this, index, 'Enumerations');
		return `/PTC/${entitySet}`;
	},
});

export default ListOperate;
