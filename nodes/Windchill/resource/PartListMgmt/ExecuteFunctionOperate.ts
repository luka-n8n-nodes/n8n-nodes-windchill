import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import NodeUtils from '../../../help/utils/NodeUtils';
import ODataUtils from '../../../help/utils/ODataUtils';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
	odataCountOption,
	odataExpandOption,
	odataFilterOption,
	odataOrderByOption,
	odataSelectOption,
	paginationOptions,
} from '../../../help/utils/sharedOptions';
import { createEntitySetProperties, resolvePartsListEntitySetPath } from './shared/entitySets';

const ExecuteFunctionOperate: ResourceOperations = {
	name: '执行函数 (Execute Function)',
	value: 'partList:executeFunction',
	action: '执行函数 (Execute Function)',
	description: '调用 PartListMgmt 域或实体绑定的 OData Function（支持标准 GET 与可选分页）',
	order: 60,
	options: [
		{
			displayName: 'Target Scope',
			name: 'targetScope',
			type: 'options',
			options: [
				{
					name: '域级函数 (/PartListMgmt/{Function})',
					value: 'unbound',
				},
				{
					name: '实体绑定函数 (/PartListMgmt/{EntitySet}({OID})/{Function})',
					value: 'entity',
				},
			],
			default: 'entity',
			description: '选择调用域级函数还是实体绑定函数',
		},
		...createEntitySetProperties('PartLists', { targetScope: ['entity'] }),
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:com.ptc.windchill.partslist.PartsList:12345',
			displayOptions: {
				show: {
					targetScope: ['entity'],
				},
			},
			description: FieldDescriptions.oid,
			hint: FieldHints.oid,
		},
		{
			displayName: 'Function Name',
			name: 'functionName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'PTC.PartListMgmt.GetPartListItems()',
			description: FieldDescriptions.functionName,
			hint: FieldHints.actionOrFunction,
		},
		{
			displayName: 'Query Parameters (JSON)',
			name: 'queryParams',
			type: 'json',
			default: '{}',
			description: '可选附加查询参数 JSON 对象',
		},
		{
			displayName: 'Enable Pagination',
			name: 'enablePagination',
			type: 'boolean',
			default: false,
			description: 'Whether to automatically paginate using Return All and Limit',
		},
		{
			...paginationOptions.returnAll,
			displayOptions: {
				show: {
					enablePagination: [true],
				},
			},
		},
		{
			...paginationOptions.limit(1000, 1, 50),
			displayOptions: {
				show: {
					enablePagination: [true],
					returnAll: [false],
				},
			},
		},
		createCommonOptions([
			odataSelectOption,
			odataExpandOption,
			odataFilterOption,
			odataOrderByOption,
			odataCountOption,
			apiVersionOption,
		]),
	],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const targetScope = String(this.getNodeParameter('targetScope', index, 'entity'));
		const rawFunctionName = String(this.getNodeParameter('functionName', index, '')).trim();
		if (!rawFunctionName) {
			throw new NodeOperationError(this.getNode(), 'Function Name cannot be empty', {
				itemIndex: index,
			});
		}

		const cleanFunc = rawFunctionName.replace(/^\/+/, '');
		let url: string;
		if (targetScope === 'entity') {
			const entitySetPath = resolvePartsListEntitySetPath(this, index);
			const id = String(this.getNodeParameter('id', index, '')).trim();
			if (!id) {
				throw new NodeOperationError(this.getNode(), 'ID cannot be empty', {
					itemIndex: index,
				});
			}
			url = `${ODataUtils.buildEntityUrl(entitySetPath, id)}/${cleanFunc}`;
		} else {
			url = cleanFunc.startsWith('PartListMgmt/')
				? `/${cleanFunc}`
				: `/PartListMgmt/${cleanFunc}`;
		}

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const { qs, headers } = ODataUtils.buildODataQueryAndHeaders(options);
		const extraQs = NodeUtils.getNodeJsonData<IDataObject>(this, 'queryParams', index, {});
		Object.assign(qs, extraQs);

		const enablePagination = Boolean(this.getNodeParameter('enablePagination', index, false));
		if (enablePagination) {
			const returnAll = Boolean(this.getNodeParameter('returnAll', index, false));
			const limit = returnAll ? undefined : (this.getNodeParameter('limit', index, 50) as number);

			return ODataUtils.executePaginatedQuery.call(
				this,
				{
					url,
					returnAll,
					limit,
					qs,
					headers,
					apiVersion: options.apiVersion,
					timeout: options.timeout,
				},
				index,
			);
		}

		return RequestUtils.request.call(
			this,
			{
				method: 'GET',
				url,
				qs,
				headers,
				apiVersion: options.apiVersion,
				timeout: options.timeout,
			},
			index,
		);
	},
};

export default ExecuteFunctionOperate;
