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

const GetPartStructureOperate: ResourceOperations = {
	name: '获取零件结构 (GetPartStructure)',
	value: 'prodMgmt:getPartStructure',
	action: '获取零件结构 (GetPartStructure)',
	description:
		"获取指定零件的多级结构 (POST Parts('{OID}')/PTC.ProdMgmt.GetPartStructure)，默认展开 Components($levels=max)",
	order: 60,
	options: [
		{
			displayName: 'Part ID (OID)',
			name: 'id',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:wt.part.WTPart:12345',
			description: FieldDescriptions.oid,
			hint: FieldHints.oid,
		},
		{
			displayName: 'Structure Expand',
			name: 'structureExpand',
			type: 'string',
			default: 'Components($levels=max)',
			placeholder: 'Components($levels=max)',
			description:
				'结构展开表达式，通过查询参数 $expand 传递。Components($levels=1) 仅展开一层子件；Components($levels=max) 展开完整多级结构；留空则不传 $expand（除非 Options 中的 Expand 已填写，则以 Options 为准）',
		},
		{
			displayName: 'Body (JSON)',
			name: 'body',
			type: 'json',
			default: '{}',
			description:
				'OData Action 请求体，例如 {"NavigationCriteria":{"ID":"OR:wt.filter.NavigationCriteria:..."}}；无额外参数时可留空为 {}',
			hint: FieldHints.jsonBody,
		},
		createCommonOptions([
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Expand ($expand)',
				name: 'expand',
				type: 'string',
				default: '',
				placeholder: 'Components($levels=max)',
				description:
					'可选覆盖 Structure Expand 的 $expand；填写后优先生效。留空则使用上方 Structure Expand',
				hint: FieldHints.navigation,
			},
			apiVersionOption,
			skipNonceOption,
			manualNonceOption,
		]),
	],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const id = String(this.getNodeParameter('id', index, '') || '').trim();
		if (!id) {
			throw new NodeOperationError(this.getNode(), 'Part ID (OID) cannot be empty', {
				itemIndex: index,
			});
		}

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const structureExpand = String(
			this.getNodeParameter('structureExpand', index, 'Components($levels=max)') || '',
		).trim();
		const expand =
			typeof options.expand === 'string' && options.expand.trim()
				? options.expand.trim()
				: structureExpand;
		const body = NodeUtils.getNodeJsonData<IDataObject>(this, 'body', index, {}) || {};
		const qs: IDataObject = {};
		if (expand) {
			qs.$expand = expand;
		}

		const url = `${ODataUtils.buildEntityUrl('/ProdMgmt/Parts', id)}/PTC.ProdMgmt.GetPartStructure`;
		const res = await RequestUtils.request.call(
			this,
			{
				method: 'POST',
				url,
				body,
				qs,
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

export default GetPartStructureOperate;
