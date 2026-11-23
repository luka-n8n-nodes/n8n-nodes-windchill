import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import {
	createDocMgmtEntitySetProperties,
	resolveDocMgmtEntitySetPath,
} from './helpers/docMgmtHelper';

const LifecycleActionOperate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '文档生命周期与检入检出 (Lifecycle Action)',
	value: 'docMgmt:lifecycleAction',
	description: '对文档执行检出、检入、取消检出、修订、设置生命周期状态或自定义 OData Action',
	order: 70,
	idParam: {
		displayName: 'Document ID (OID)',
		placeholder: 'OR:wt.doc.WTDocument:12345',
		description: '文档实体唯一标识符（OID）',
	},
	extraProperties: [
		...createDocMgmtEntitySetProperties(),
		{
			displayName: 'Action',
			name: 'actionName',
			type: 'options',
			required: true,
			options: [
				{ name: 'CheckIn - 检入 (PTC.DocMgmt.CheckIn)', value: 'PTC.DocMgmt.CheckIn' },
				{ name: 'CheckOut - 检出 (PTC.DocMgmt.CheckOut)', value: 'PTC.DocMgmt.CheckOut' },
				{ name: 'Custom - 自定义 Action', value: 'custom' },
				{ name: 'Revise - 修订 (PTC.DocMgmt.Revise)', value: 'PTC.DocMgmt.Revise' },
				{
					name: 'SetState - 设置生命周期状态 (PTC.DocMgmt.SetState)',
					value: 'PTC.DocMgmt.SetState',
				},
				{
					name: 'UndoCheckOut - 取消检出 (PTC.DocMgmt.UndoCheckOut)',
					value: 'PTC.DocMgmt.UndoCheckOut',
				},
			],
			default: 'PTC.DocMgmt.CheckOut',
			description: '选择要执行的文档生命周期或检入检出 Action',
		},
		{
			displayName: 'Custom Action Name',
			name: 'customActionName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'PTC.DocMgmt.CheckOut',
			displayOptions: {
				show: {
					actionName: ['custom'],
				},
			},
			description: FieldDescriptions.actionName,
			hint: FieldHints.actionOrFunction,
		},
	],
	includeJsonBody: true,
	bodyDisplayName: 'Action Parameters (JSON)',
	bodyDescription:
		'OData Action 请求体 JSON 参数（例如 CheckIn 传 {"Comment":"..."}，SetState 传 {"State":{"Value":"RELEASED","Display":"Released"}}）',
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number): string {
		const id = String(this.getNodeParameter('id', index, '') || '').trim();
		if (!id) {
			throw new NodeOperationError(this.getNode(), 'Document ID (OID) 不能为空', {
				itemIndex: index,
			});
		}
		const entitySetPath = resolveDocMgmtEntitySetPath(this, index);
		const actionChoice = String(this.getNodeParameter('actionName', index, '') || '').trim();
		const actionName =
			actionChoice === 'custom'
				? String(this.getNodeParameter('customActionName', index, '') || '')
						.trim()
						.replace(/^\/+|\/+$/g, '')
				: actionChoice;

		if (!actionName) {
			throw new NodeOperationError(this.getNode(), 'Action 名称不能为空', {
				itemIndex: index,
			});
		}

		return `${entitySetPath}('{id}')/${actionName}`;
	},
});

export default LifecycleActionOperate;
