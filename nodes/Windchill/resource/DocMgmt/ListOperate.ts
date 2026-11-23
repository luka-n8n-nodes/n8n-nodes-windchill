import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDocMgmtEntitySetProperties,
	resolveDocMgmtEntitySetPath,
} from './helpers/docMgmtHelper';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'docMgmt:list',
	description: '分页查询文档管理域实体列表（支持 Return All、Limit 与 OData 查询参数）',
	order: 10,
	extraProperties: createDocMgmtEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveDocMgmtEntitySetPath(this, index);
	},
});

export default ListOperate;
