import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createProdMgmtEntitySetProperties,
	resolveProdMgmtEntitySetPath,
} from './helpers/prodMgmtHelper';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'prodMgmt:delete',
	description: '根据 OID 删除指定的产品管理实体',
	order: 50,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.part.WTPart:12345',
	},
	extraProperties: createProdMgmtEntitySetProperties(),
	path(this: IExecuteFunctions, index: number): string {
		return resolveProdMgmtEntitySetPath(this, index);
	},
});

export default DeleteOperate;
