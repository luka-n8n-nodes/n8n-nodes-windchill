import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildPrincipalMgmtEntitySetProperties,
	resolvePrincipalMgmtEntitySet,
} from './common/entitySets';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'principalMgmt:list',
	description: '查询 PrincipalMgmt 实体集列表（支持 Return All 与 Limit 分页）',
	order: 10,
	extraProperties: buildPrincipalMgmtEntitySetProperties('Users'),
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolvePrincipalMgmtEntitySet(this, index, 'Users');
		return `/PrincipalMgmt/${entitySet}`;
	},
});

export default ListOperate;
