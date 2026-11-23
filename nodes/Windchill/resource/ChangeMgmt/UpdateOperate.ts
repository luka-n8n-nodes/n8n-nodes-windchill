import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildChangeMgmtEntitySetProperties,
	resolveChangeMgmtEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新变更实体 (Update)',
	value: 'changeMgmt:update',
	order: 40,
	description: '更新指定 OID 的变更实体属性',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.change2.WTChangeRequest2:12345',
		description: '待更新变更实体的 Windchill OID',
	},
	extraProperties: buildChangeMgmtEntitySetProperties('ChangeRequests'),
	fields: [
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			description: '更新后的变更名称（留空则不修改）',
		},
		{
			displayName: 'Description',
			name: 'Description',
			type: 'string',
			default: '',
			description: '更新后的变更描述（留空则不修改）',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number) {
		return resolveChangeMgmtEntitySetPath(this, index, 'ChangeRequests');
	},
});

export default operate;
