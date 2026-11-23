import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createCadEntitySetProperties, resolveCadEntitySetPath } from './helpers/cadDocMgmtHelper';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'cadDocumentMgmt:delete',
	description: '根据 OID 删除指定的 CAD 文档管理域实体',
	order: 50,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.epm.EPMDocument:12345',
	},
	extraProperties: createCadEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveCadEntitySetPath(this, index);
	},
});

export default DeleteOperate;
