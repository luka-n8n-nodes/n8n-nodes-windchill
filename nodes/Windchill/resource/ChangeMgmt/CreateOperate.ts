import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildChangeMgmtEntitySetProperties,
	resolveChangeMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建变更实体 (Create)',
	value: 'changeMgmt:create',
	order: 30,
	description: '在 ChangeMgmt 域下创建变更请求、变更通知、变更问题或变更活动',
	extraProperties: buildChangeMgmtEntitySetProperties('ChangeRequests'),
	fields: [
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			description: '变更实体名称',
		},
		{
			displayName: 'Number',
			name: 'Number',
			type: 'string',
			default: '',
			description: '变更编号（可选，留空由 Windchill 自动生成）',
		},
		{
			displayName: 'Description',
			name: 'Description',
			type: 'string',
			default: '',
			description: '变更描述说明',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription:
		'附加字段 JSON（如 NeedDate、Complexity、Context@odata.bind 等），将与上方表单字段合并发送',
	path(this: IExecuteFunctions, index: number) {
		return resolveChangeMgmtEntitySetPath(this, index, 'ChangeRequests');
	},
});

export default operate;
