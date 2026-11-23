import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';
import { createEntitySetProperties, resolvePartsListEntitySetPath } from './shared/entitySets';

const ExecuteActionOperate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '执行操作 (Execute Action)',
	value: 'partList:executeAction',
	description: '调用 PartListMgmt 域或实体绑定的 OData Action（POST，自动处理 NONCE）',
	order: 70,
	idParam: false,
	includeJsonBody: true,
	bodyRequired: false,
	extraProperties: [
		{
			displayName: 'Target Scope',
			name: 'targetScope',
			type: 'options',
			options: [
				{
					name: '域级操作 (/PartListMgmt/{Action})',
					value: 'unbound',
				},
				{
					name: '实体绑定操作 (/PartListMgmt/{EntitySet}({OID})/{Action})',
					value: 'entity',
				},
			],
			default: 'entity',
			description: '选择调用域级 Action 还是实体绑定 Action',
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
			displayName: 'Action Name',
			name: 'actionName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'PTC.PartListMgmt.GeneratePartsList',
			description: FieldDescriptions.actionName,
			hint: FieldHints.actionOrFunction,
		},
	],
	path(this: IExecuteFunctions, index: number): string {
		const targetScope = String(this.getNodeParameter('targetScope', index, 'entity'));
		const rawActionName = String(this.getNodeParameter('actionName', index, '')).trim();
		if (!rawActionName) {
			throw new NodeOperationError(this.getNode(), 'Action Name cannot be empty', {
				itemIndex: index,
			});
		}

		const cleanAction = rawActionName.replace(/^\/+/, '');
		if (targetScope === 'entity') {
			const entitySetPath = resolvePartsListEntitySetPath(this, index);
			const id = String(this.getNodeParameter('id', index, '')).trim();
			if (!id) {
				throw new NodeOperationError(this.getNode(), 'ID cannot be empty', {
					itemIndex: index,
				});
			}
			return `${ODataUtils.buildEntityUrl(entitySetPath, id)}/${cleanAction}`;
		}

		return cleanAction.startsWith('PartListMgmt/')
			? `/${cleanAction}`
			: `/PartListMgmt/${cleanAction}`;
	},
});

export default ExecuteActionOperate;
