import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildChangeMgmtEntitySetProperties,
	resolveChangeMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '获取变更列表 (List)',
	value: 'changeMgmt:list',
	order: 10,
	description: '分页查询 ChangeMgmt 域下的变更实体列表（支持 Return All 与 Limit）',
	extraProperties: buildChangeMgmtEntitySetProperties('ChangeRequests'),
	path(this: IExecuteFunctions, index: number) {
		return resolveChangeMgmtEntitySetPath(this, index, 'ChangeRequests');
	},
});

export default operate;
