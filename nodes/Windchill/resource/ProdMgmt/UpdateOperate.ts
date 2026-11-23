import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import NodeUtils from '../../../help/utils/NodeUtils';
import ODataUtils from '../../../help/utils/ODataUtils';
import RequestUtils from '../../../help/utils/RequestUtils';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
	manualNonceOption,
	skipNonceOption,
} from '../../../help/utils/sharedOptions';
import {
	createProdMgmtEntitySetProperties,
	resolveProdMgmtEntitySetPath,
} from './helpers/prodMgmtHelper';

const UpdateOperate: ResourceOperations = {
	name: '更新实体 (Update)',
	value: 'prodMgmt:update',
	action: '更新实体 (Update)',
	description: '使用 PATCH 或 PUT 更新指定 OID 的产品管理实体',
	order: 40,
	options: [
		{
			displayName: 'Entity ID (OID)',
			name: 'id',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:wt.part.WTPart:12345',
			description: FieldDescriptions.oid,
			hint: FieldHints.oid,
		},
		...createProdMgmtEntitySetProperties(),
		{
			displayName: 'HTTP Method',
			name: 'httpMethod',
			type: 'options',
			options: [
				{ name: 'PATCH（部分更新）', value: 'PATCH' },
				{ name: 'PUT（全量替换）', value: 'PUT' },
			],
			default: 'PATCH',
			description: '选择更新使用的 HTTP 方法',
		},
		{
			displayName: 'Body (JSON)',
			name: 'body',
			type: 'json',
			required: true,
			default: '{}',
			description: '需要更新的 JSON 字段数据',
		},
		createCommonOptions([apiVersionOption, skipNonceOption, manualNonceOption]),
	],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const id = String(this.getNodeParameter('id', index, '') || '').trim();
		if (!id) {
			throw new NodeOperationError(this.getNode(), 'Entity ID (OID) 不能为空', {
				itemIndex: index,
			});
		}

		const entitySetPath = resolveProdMgmtEntitySetPath(this, index);
		const url = ODataUtils.buildEntityUrl(entitySetPath, id);
		const method = this.getNodeParameter('httpMethod', index, 'PATCH') as 'PATCH' | 'PUT';
		const body = NodeUtils.getNodeJsonData<IDataObject>(this, 'body', index, {});
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const res = await RequestUtils.request.call(
			this,
			{
				method,
				url,
				body,
				apiVersion: options.apiVersion,
				skipNonce: options.skipNonce,
				manualNonce: options.manualNonce,
				timeout: options.timeout,
			},
			index,
		);

		if (res === undefined || res === null || res === '') {
			return { success: true, id };
		}
		return res;
	},
};

export default UpdateOperate;
