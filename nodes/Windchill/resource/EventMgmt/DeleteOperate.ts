import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildEventMgmtEntitySetProperties,
	resolveEventMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除事件订阅 (Delete)',
	value: 'eventMgmt:delete',
	order: 30,
	description: '删除指定 OID 的事件订阅或实体',
	idParam: {
		displayName: 'Subscription ID (OID)',
		placeholder: 'OR:wt.events.EventSubscription:12345',
		description: '待删除事件订阅的 Windchill OID',
	},
	extraProperties: buildEventMgmtEntitySetProperties('EventSubscriptions'),
	path(this: IExecuteFunctions, index: number) {
		return resolveEventMgmtEntitySetPath(this, index, 'EventSubscriptions');
	},
});

export default operate;
