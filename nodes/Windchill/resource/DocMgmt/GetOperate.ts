import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDocMgmtEntitySetProperties,
	createDocMgmtNavigationProperties,
	resolveDocMgmtEntitySetPath,
	resolveDocMgmtNavigation,
} from './helpers/docMgmtHelper';

const GetOperate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取实体详情 (Get)',
	value: 'docMgmt:get',
	description:
		'根据 OID 获取单个文档实体详情或展开导航属性（PrimaryContent/Attachments/Versions/Master）',
	order: 20,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.doc.WTDocument:12345',
		description: '文档实体唯一标识符（例如 OR:wt.doc.WTDocument:12345）',
	},
	extraProperties: [...createDocMgmtEntitySetProperties(), ...createDocMgmtNavigationProperties()],
	path(this: IExecuteFunctions, index: number): string {
		const entitySetPath = resolveDocMgmtEntitySetPath(this, index);
		const nav = resolveDocMgmtNavigation(this, index);
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
