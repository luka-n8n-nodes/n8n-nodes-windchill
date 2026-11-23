import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildChangeMgmtEntitySetProperties,
	resolveChangeMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除变更实体 (Delete)',
	value: 'changeMgmt:delete',
	order: 50,
	description: '删除指定 OID 的变更实体',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.change2.WTChangeRequest2:12345',
		description: '待删除变更实体的 Windchill OID',
	},
	extraProperties: buildChangeMgmtEntitySetProperties('ChangeRequests'),
	path(this: IExecuteFunctions, index: number) {
		return resolveChangeMgmtEntitySetPath(this, index, 'ChangeRequests');
	},
});

export default operate;
