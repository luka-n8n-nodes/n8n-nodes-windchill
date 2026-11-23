import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDynamicDocEntitySetProperties,
	createDynamicDocNavigationProperties,
	resolveDynamicDocEntitySetPath,
	resolveDynamicDocNavigation,
} from './helpers/dynamicDocMgmtHelper';

const GetOperate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取实体详情 (Get)',
	value: 'dynamicDocMgmt:get',
	description: '根据 OID 获取单个动态文档实体详情或展开导航属性',
	order: 20,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.epm.EPMDocument:12345',
		description: '动态文档实体唯一标识符（OID）',
	},
	extraProperties: [
		...createDynamicDocEntitySetProperties(),
		...createDynamicDocNavigationProperties(),
	],
	path(this: IExecuteFunctions, index: number): string {
		const entitySetPath = resolveDynamicDocEntitySetPath(this, index);
		const nav = resolveDynamicDocNavigation(this, index);
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
