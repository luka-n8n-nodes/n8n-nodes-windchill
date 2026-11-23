import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildEventMgmtEntitySetProperties,
	resolveEventMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '获取事件列表 (List)',
	value: 'eventMgmt:list',
	order: 10,
	description: '分页查询 EventMgmt 域下的订阅、事件类型或投递通道列表（支持 Return All 与 Limit）',
	extraProperties: buildEventMgmtEntitySetProperties('EventSubscriptions'),
	path(this: IExecuteFunctions, index: number) {
		return resolveEventMgmtEntitySetPath(this, index, 'EventSubscriptions');
	},
});

export default operate;
