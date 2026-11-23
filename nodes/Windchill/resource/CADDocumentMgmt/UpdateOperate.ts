import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createCadEntitySetProperties, resolveCadEntitySetPath } from './helpers/cadDocMgmtHelper';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新实体 (Update)',
	value: 'cadDocumentMgmt:update',
	description: '更新指定 OID 的 CAD 文档管理域实体属性',
	order: 40,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.epm.EPMDocument:12345',
	},
	extraProperties: createCadEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveCadEntitySetPath(this, index);
	},
});

export default UpdateOperate;
