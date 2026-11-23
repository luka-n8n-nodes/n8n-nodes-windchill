import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createCadEntitySetProperties, resolveCadEntitySetPath } from './helpers/cadDocMgmtHelper';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'cadDocumentMgmt:list',
	description: '分页查询 CAD 文档管理域实体列表（支持 Return All、Limit 与 OData 查询参数）',
	order: 10,
	extraProperties: createCadEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveCadEntitySetPath(this, index);
	},
});

export default ListOperate;
