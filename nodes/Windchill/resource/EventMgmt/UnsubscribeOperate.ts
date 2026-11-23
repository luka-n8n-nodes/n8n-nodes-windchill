import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '取消订阅 (Unsubscribe)',
	value: 'eventMgmt:unsubscribe',
	order: 60,
	description: '取消事件订阅 (PTC.EventMgmt.Unsubscribe)',
	idParam: {
		displayName: 'Subscription ID (OID)',
		required: false,
		default: '',
		placeholder: 'OR:wt.events.EventSubscription:12345',
		description:
			"可选订阅 OID；填写时调用 EventSubscriptions('{OID}')/PTC.EventMgmt.Unsubscribe，留空时调用 /EventMgmt/PTC.EventMgmt.Unsubscribe",
	},
	path(this: IExecuteFunctions, index: number) {
		const id = String(this.getNodeParameter('id', index, '') || '').trim();
		return id ? '/EventMgmt/EventSubscriptions' : '/EventMgmt';
	},
	actionName: 'PTC.EventMgmt.Unsubscribe',
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription: '可选 OData Action 请求体 JSON 参数（如订阅标识或扩展参数）',
});

export default operate;
