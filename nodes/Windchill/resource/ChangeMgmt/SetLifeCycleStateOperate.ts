import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldHints } from '../../../help/utils/fieldHints';
import NodeUtils from '../../../help/utils/NodeUtils';
import {
	buildChangeMgmtEntitySetProperties,
	resolveChangeMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '设置生命周期状态 (Set State)',
	value: 'changeMgmt:setLifeCycleState',
	order: 60,
	description: '调用 PTC.ChangeMgmt.SetState 设置变更实体的生命周期状态',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.change2.WTChangeRequest2:12345',
		description: '目标变更实体的 Windchill OID',
	},
	extraProperties: buildChangeMgmtEntitySetProperties('ChangeRequests'),
	actionName: 'PTC.ChangeMgmt.SetState',
	fields: [
		{
			displayName: 'State Value',
			name: 'stateValue',
			type: 'string',
			default: '',
			placeholder: 'UNDERREVIEW',
			description: '目标生命周期状态内部值（例如 INWORK、UNDERREVIEW、RELEASED）',
			hint: FieldHints.lifecycleState,
		},
		{
			displayName: 'State Display',
			name: 'stateDisplay',
			type: 'string',
			default: '',
			placeholder: 'Under Review',
			description: '生命周期状态显示名（可任意填写；服务端以 State Value 为准）',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription: '附加 OData Action 请求体 JSON（将与 State 对象合并）',
	path(this: IExecuteFunctions, index: number) {
		return resolveChangeMgmtEntitySetPath(this, index, 'ChangeRequests');
	},
	buildBody(this: IExecuteFunctions, index: number): IDataObject {
		const stateValue = String(this.getNodeParameter('stateValue', index, '') || '').trim();
		const stateDisplay = String(this.getNodeParameter('stateDisplay', index, '') || '').trim();
		const jsonPayload = NodeUtils.getNodeJsonData<IDataObject>(this, 'body', index, {}) || {};
		const payload: IDataObject = {};
		if (stateValue) {
			payload.State = {
				Value: stateValue,
				Display: stateDisplay || stateValue,
			};
		}
		return { ...payload, ...jsonPayload };
	},
});

export default operate;
