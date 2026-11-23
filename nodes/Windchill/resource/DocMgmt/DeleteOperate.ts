import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDocMgmtEntitySetProperties,
	resolveDocMgmtEntitySetPath,
} from './helpers/docMgmtHelper';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除文档/附件 (Delete)',
	value: 'docMgmt:delete',
	description: '根据 OID 删除指定的文档或附件实体',
	order: 50,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.doc.WTDocument:12345',
	},
	extraProperties: createDocMgmtEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveDocMgmtEntitySetPath(this, index);
	},
});

export default DeleteOperate;
