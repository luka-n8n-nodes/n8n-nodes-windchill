import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createProdMgmtEntitySetProperties,
	resolveProdMgmtEntitySetPath,
} from './helpers/prodMgmtHelper';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'prodMgmt:create',
	description: '在产品管理域创建实体（支持预设常用字段与 JSON Deep Insert / @odata.bind）',
	order: 30,
	extraProperties: createProdMgmtEntitySetProperties(),
	fields: [
		{
			displayName: 'Number',
			name: 'Number',
			type: 'string',
			default: '',
			placeholder: 'PART-0001',
			description: '零件编号（可选，也可在下方 JSON Body 中传入或覆盖）',
		},
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			placeholder: 'Sample Part',
			description: '零件名称（可选）',
		},
		{
			displayName: 'Default Unit',
			name: 'DefaultUnit',
			type: 'string',
			default: '',
			placeholder: 'ea',
			description: '默认计量单位（如 ea、kg；留空或可在 JSON Body 中设置完整对象）',
		},
	],
	includeJsonBody: true,
	bodyDisplayName: 'Additional Fields / Deep Insert (JSON)',
	bodyDescription:
		'附加字段或 Deep Insert 关联 JSON（支持 @odata.bind，如 {"Folder@odata.bind": "Containers(\'...\')/Folders(\'...\')"}），会与上方字段合并',
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number): string {
		return resolveProdMgmtEntitySetPath(this, index);
	},
});

export default CreateOperate;
