import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDynamicDocEntitySetProperties,
	resolveDynamicDocEntitySetPath,
} from './helpers/dynamicDocMgmtHelper';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'dynamicDocMgmt:create',
	description: '在动态文档管理域创建实体（支持 @odata.bind Deep Insert）',
	order: 30,
	extraProperties: createDynamicDocEntitySetProperties(),
	fields: [
		{
			displayName: 'Number',
			name: 'Number',
			type: 'string',
			default: '',
			placeholder: 'DYNDOC-0001',
			description: '动态文档编号（可选，也可在下方 JSON Body 中传入）',
		},
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			placeholder: 'Sample Dynamic Document',
			description: '动态文档名称（可选）',
		},
	],
	includeJsonBody: true,
	bodyDisplayName: 'Additional Fields / Deep Insert (JSON)',
	bodyDescription: '附加字段或关联 JSON 数据（支持 @odata.bind），会与上方字段合并',
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number): string {
		return resolveDynamicDocEntitySetPath(this, index);
	},
});

export default CreateOperate;
