import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildEventMgmtEntitySetProperties,
	resolveEventMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取事件详情 (Get)',
	value: 'eventMgmt:get',
	order: 20,
	description: '根据 OID 获取 EventMgmt 域下单个实体的详细信息',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.events.EventSubscription:12345',
		description: '事件订阅或相关实体的 Windchill OID',
	},
	extraProperties: buildEventMgmtEntitySetProperties('EventSubscriptions'),
	path(this: IExecuteFunctions, index: number) {
		return resolveEventMgmtEntitySetPath(this, index, 'EventSubscriptions');
	},
});

export default operate;
