import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDocMgmtEntitySetProperties,
	resolveDocMgmtEntitySetPath,
} from './helpers/docMgmtHelper';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新文档 (Update)',
	value: 'docMgmt:update',
	description: '更新指定 OID 的文档或附件实体属性',
	order: 40,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.doc.WTDocument:12345',
	},
	extraProperties: createDocMgmtEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveDocMgmtEntitySetPath(this, index);
	},
});

export default UpdateOperate;
