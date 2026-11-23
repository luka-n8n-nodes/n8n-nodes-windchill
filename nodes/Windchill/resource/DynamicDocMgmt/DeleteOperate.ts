import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDynamicDocEntitySetProperties,
	resolveDynamicDocEntitySetPath,
} from './helpers/dynamicDocMgmtHelper';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'dynamicDocMgmt:delete',
	description: '根据 OID 删除指定的动态文档管理域实体',
	order: 50,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.epm.EPMDocument:12345',
	},
	extraProperties: createDynamicDocEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveDynamicDocEntitySetPath(this, index);
	},
});

export default DeleteOperate;
