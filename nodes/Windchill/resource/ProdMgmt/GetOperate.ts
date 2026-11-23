import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createProdMgmtEntitySetProperties,
	createProdMgmtNavigationProperties,
	resolveProdMgmtEntitySetPath,
	resolveProdMgmtNavigation,
} from './helpers/prodMgmtHelper';

const GetOperate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取实体详情 (Get)',
	value: 'prodMgmt:get',
	description: '根据 OID 获取单个产品管理实体详情或展开指定导航属性',
	order: 20,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.part.WTPart:12345',
		description: '实体唯一标识符（例如 OR:wt.part.WTPart:12345 或 VR:wt.part.WTPart:12345）',
	},
	extraProperties: [
		...createProdMgmtEntitySetProperties(),
		...createProdMgmtNavigationProperties(),
	],
	path(this: IExecuteFunctions, index: number): string {
		const entitySetPath = resolveProdMgmtEntitySetPath(this, index);
		const nav = resolveProdMgmtNavigation(this, index);
		if (!nav) {
			return entitySetPath;
		}
		const id = String(this.getNodeParameter('id', index, '') || '').trim();
		if (!id) {
			throw new NodeOperationError(this.getNode(), 'Entity ID (OID) 不能为空', {
				itemIndex: index,
			});
		}
		return `${entitySetPath}('{id}')/${nav}`;
	},
});

export default GetOperate;
