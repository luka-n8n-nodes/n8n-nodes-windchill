import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '订阅对象事件 (Subscribe To Event)',
	value: 'eventMgmt:subscribeToEvent',
	order: 40,
	description: '订阅指定对象实例的事件通知 (PTC.EventMgmt.SubscribeToEvent)',
	idParam: false,
	path: '/EventMgmt',
	actionName: 'PTC.EventMgmt.SubscribeToEvent',
	includeJsonBody: true,
	bodyRequired: true,
	bodyDescription:
		'OData Action 请求体 JSON 参数（如目标对象、EventType、DeliveryChannel 等订阅参数）',
});

export default operate;
