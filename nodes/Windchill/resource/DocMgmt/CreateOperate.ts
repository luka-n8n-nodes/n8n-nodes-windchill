import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	createDocMgmtEntitySetProperties,
	resolveDocMgmtEntitySetPath,
} from './helpers/docMgmtHelper';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建文档/附件 (Create)',
	value: 'docMgmt:create',
	description: '在文档管理域创建文档或附件实体（支持 @odata.bind Deep Insert）',
	order: 30,
	extraProperties: createDocMgmtEntitySetProperties(),
	fields: [
		{
			displayName: 'Number',
			name: 'Number',
			type: 'string',
			default: '',
			placeholder: 'DOC-0001',
			description: '文档编号（可选，也可在下方 JSON Body 中传入）',
		},
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			placeholder: 'Sample Document',
			description: '文档名称（可选）',
		},
	],
	includeJsonBody: true,
	bodyDisplayName: 'Additional Fields / Deep Insert (JSON)',
	bodyDescription:
		'附加字段或关联 JSON 数据（支持 @odata.bind，例如绑定 Folder 或 Document），会与上方字段合并',
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number): string {
		return resolveDocMgmtEntitySetPath(this, index);
	},
});

export default CreateOperate;
