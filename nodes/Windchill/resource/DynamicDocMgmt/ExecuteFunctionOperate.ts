import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import NodeUtils from '../../../help/utils/NodeUtils';
import ODataUtils from '../../../help/utils/ODataUtils';
import {
	createDynamicDocEntitySetProperties,
	resolveDynamicDocEntitySetPath,
} from './helpers/dynamicDocMgmtHelper';

const ExecuteFunctionOperate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '调用函数 (Execute Function)',
	value: 'dynamicDocMgmt:executeFunction',
	description: '调用 DynamicDocMgmt 域级或实体绑定 OData Function (GET)',
	order: 60,
	idParam: false,
	params: [
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'options',
			options: [
				{ name: '实体绑定函数 (Entity Bound)', value: 'entity' },
				{ name: '域级函数 (Domain Unbound)', value: 'domain' },
			],
			default: 'entity',
			description: '选择调用绑定到指定实体的函数或直接调用域级函数',
		},
		...createDynamicDocEntitySetProperties('DynamicDocuments', { scope: ['entity'] }),
		{
			displayName: 'Entity ID (OID)',
			name: 'entityId',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:wt.epm.EPMDocument:12345',
			displayOptions: {
				show: {
					scope: ['entity'],
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
			placeholder: 'PTC.DynamicDocMgmt.GetStructure',
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
	],
	path(this: IExecuteFunctions, index: number): string {
		const scope = String(this.getNodeParameter('scope', index, 'entity') || 'entity');
		const functionName = String(this.getNodeParameter('functionName', index, '') || '')
			.trim()
			.replace(/^\/+/, '');
		if (!functionName) {
			throw new NodeOperationError(this.getNode(), 'Function Name 不能为空', {
				itemIndex: index,
			});
		}

		if (scope === 'domain') {
			return `/DynamicDocMgmt/${functionName}`;
		}

		const entityId = String(this.getNodeParameter('entityId', index, '') || '').trim();
		if (!entityId) {
			throw new NodeOperationError(this.getNode(), 'Entity ID (OID) 不能为空', {
				itemIndex: index,
			});
		}
		const entitySetPath = resolveDynamicDocEntitySetPath(this, index);
		return `${ODataUtils.buildEntityUrl(entitySetPath, entityId)}/${functionName}`;
	},
	buildQuery(this: IExecuteFunctions, index: number): IDataObject {
		return NodeUtils.getNodeJsonData<IDataObject>(this, 'queryParams', index, {});
	},
});

export default ExecuteFunctionOperate;
