import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDynamicDocEntitySetProperties,
	resolveDynamicDocEntitySetPath,
} from './helpers/dynamicDocMgmtHelper';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'dynamicDocMgmt:list',
	description: '分页查询动态文档管理域实体列表（支持 Return All、Limit 与 OData 查询参数）',
	order: 10,
	extraProperties: createDynamicDocEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveDynamicDocEntitySetPath(this, index);
	},
});

export default ListOperate;
