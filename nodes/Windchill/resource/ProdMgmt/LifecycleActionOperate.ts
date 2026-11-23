import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import {
	createProdMgmtEntitySetProperties,
	resolveProdMgmtEntitySetPath,
} from './helpers/prodMgmtHelper';

const LifecycleActionOperate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '生命周期与检入检出 (Lifecycle Action)',
	value: 'prodMgmt:lifecycleAction',
	description: '对零件执行检出、检入、取消检出、修订、设置生命周期状态或自定义 OData Action',
	order: 110,
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.part.WTPart:12345',
		description: '零件实体唯一标识符（OID）',
	},
	extraProperties: [
		...createProdMgmtEntitySetProperties(),
		{
			displayName: 'Action',
			name: 'actionName',
			type: 'options',
			required: true,
			options: [
				{ name: 'CheckIn - 检入 (PTC.ProdMgmt.CheckIn)', value: 'PTC.ProdMgmt.CheckIn' },
				{ name: 'CheckOut - 检出 (PTC.ProdMgmt.CheckOut)', value: 'PTC.ProdMgmt.CheckOut' },
				{ name: 'Custom - 自定义 Action', value: 'custom' },
				{ name: 'Revise - 修订 (PTC.ProdMgmt.Revise)', value: 'PTC.ProdMgmt.Revise' },
				{
					name: 'SetState - 设置生命周期状态 (PTC.ProdMgmt.SetState)',
					value: 'PTC.ProdMgmt.SetState',
				},
				{
					name: 'UndoCheckOut - 取消检出 (PTC.ProdMgmt.UndoCheckOut)',
					value: 'PTC.ProdMgmt.UndoCheckOut',
				},
			],
			default: 'PTC.ProdMgmt.CheckOut',
			description: '选择要执行的生命周期或检入检出 Action',
		},
		{
			displayName: 'Custom Action Name',
			name: 'customActionName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'PTC.ProdMgmt.CheckOut',
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
			throw new NodeOperationError(this.getNode(), 'Entity ID (OID) 不能为空', {
				itemIndex: index,
			});
		}
		const entitySetPath = resolveProdMgmtEntitySetPath(this, index);
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
