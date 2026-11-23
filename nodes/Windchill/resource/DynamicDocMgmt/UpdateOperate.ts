import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDynamicDocEntitySetProperties,
	resolveDynamicDocEntitySetPath,
} from './helpers/dynamicDocMgmtHelper';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新实体 (Update)',
	value: 'dynamicDocMgmt:update',
	description: '更新指定 OID 的动态文档管理域实体属性',
	order: 40,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.epm.EPMDocument:12345',
	},
	extraProperties: createDynamicDocEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveDynamicDocEntitySetPath(this, index);
	},
});

export default UpdateOperate;
