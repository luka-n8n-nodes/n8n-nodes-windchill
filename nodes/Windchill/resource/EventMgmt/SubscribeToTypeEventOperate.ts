import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '订阅类型事件 (Subscribe To Type Event)',
	value: 'eventMgmt:subscribeToTypeEvent',
	order: 50,
	description: '订阅指定对象类型的事件通知 (PTC.EventMgmt.SubscribeToTypeEvent)',
	idParam: false,
	path: '/EventMgmt',
	actionName: 'PTC.EventMgmt.SubscribeToTypeEvent',
	includeJsonBody: true,
	bodyRequired: true,
	bodyDescription:
		'OData Action 请求体 JSON 参数（如对象类型、EventType、DeliveryChannel 等订阅参数）',
});

export default operate;
