import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';
import {
	createDynamicDocEntitySetProperties,
	resolveDynamicDocEntitySetPath,
} from './helpers/dynamicDocMgmtHelper';

const ExecuteActionOperate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '调用操作 (Execute Action)',
	value: 'dynamicDocMgmt:executeAction',
	description: '调用 DynamicDocMgmt 域级或实体绑定 OData Action (POST，自动处理 NONCE)',
	order: 70,
	idParam: false,
	extraProperties: [
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'options',
			options: [
				{ name: '实体绑定操作 (Entity Bound)', value: 'entity' },
				{ name: '域级操作 (Domain Unbound)', value: 'domain' },
			],
			default: 'entity',
			description: '选择调用绑定到指定实体的 Action 或直接调用域级 Action',
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
			displayName: 'Action Name',
			name: 'actionName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'PTC.DynamicDocMgmt.CheckOut',
			description: FieldDescriptions.actionName,
			hint: FieldHints.actionOrFunction,
		},
	],
	includeJsonBody: true,
	bodyDisplayName: 'Action Parameters (JSON)',
	bodyDescription: 'OData Action 请求体 JSON 参数',
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number): string {
		const scope = String(this.getNodeParameter('scope', index, 'entity') || 'entity');
		const actionName = String(this.getNodeParameter('actionName', index, '') || '')
			.trim()
			.replace(/^\/+/, '');
		if (!actionName) {
			throw new NodeOperationError(this.getNode(), 'Action Name 不能为空', {
				itemIndex: index,
			});
		}

		if (scope === 'domain') {
			return `/DynamicDocMgmt/${actionName}`;
		}

		const entityId = String(this.getNodeParameter('entityId', index, '') || '').trim();
		if (!entityId) {
			throw new NodeOperationError(this.getNode(), 'Entity ID (OID) 不能为空', {
				itemIndex: index,
			});
		}
		const entitySetPath = resolveDynamicDocEntitySetPath(this, index);
		return `${ODataUtils.buildEntityUrl(entitySetPath, entityId)}/${actionName}`;
	},
});

export default ExecuteActionOperate;
