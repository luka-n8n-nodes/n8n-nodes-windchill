import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createCadEntitySetProperties, resolveCadEntitySetPath } from './helpers/cadDocMgmtHelper';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'cadDocumentMgmt:create',
	description: '在 CAD 文档管理域创建实体或关联（支持 @odata.bind Deep Insert）',
	order: 30,
	extraProperties: createCadEntitySetProperties(),
	fields: [
		{
			displayName: 'Number',
			name: 'Number',
			type: 'string',
			default: '',
			placeholder: 'CAD-0001.prt',
			description: 'CAD 文档编号（可选，也可在下方 JSON Body 中传入）',
		},
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			placeholder: 'Sample CAD Document',
			description: 'CAD 文档名称（可选）',
		},
	],
	includeJsonBody: true,
	bodyDisplayName: 'Additional Fields / Deep Insert (JSON)',
	bodyDescription:
		'附加字段或关联 JSON 数据（支持 @odata.bind，如 PartDocAssociations 绑定），会与上方字段合并',
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number): string {
		return resolveCadEntitySetPath(this, index);
	},
});

export default CreateOperate;
