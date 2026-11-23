import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createProdMgmtEntitySetProperties,
	resolveProdMgmtEntitySetPath,
} from './helpers/prodMgmtHelper';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'prodMgmt:list',
	description: '分页查询产品管理域实体列表（支持 Return All、Limit 与 OData 查询参数）',
	order: 10,
	extraProperties: createProdMgmtEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveProdMgmtEntitySetPath(this, index);
	},
});

export default ListOperate;
