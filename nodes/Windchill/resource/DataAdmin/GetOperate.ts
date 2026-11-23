import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';
import { buildDataAdminEntitySetProperties, resolveDataAdminEntitySet } from './common/entitySets';

const GetOperate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取实体 / 导航属性 (Get)',
	value: 'dataAdmin:get',
	description:
		'获取 DataAdmin 单个实体详情或关联导航属性（SubFolders、Contents、ParentFolder、Cabinet 等）',
	order: 20,
	idParam: false,
	extraProperties: [
		...buildDataAdminEntitySetProperties('Folders'),
		{
			displayName: 'Entity ID (OID)',
			name: 'id',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:wt.folder.SubFolder:12345',
			description: FieldDescriptions.oid,
			hint: FieldHints.oid,
		},
		{
			displayName: 'Navigation Property',
			name: 'navigationProperty',
			type: 'options',
			default: '',
			options: [
				{ name: 'Cabinet（所属存储柜）', value: 'Cabinet' },
				{ name: 'Contents（文件夹内容）', value: 'Contents' },
				{ name: 'Custom（自定义导航属性）', value: 'custom' },
				{ name: 'None（实体本身）', value: '' },
				{ name: 'ParentFolder（父文件夹）', value: 'ParentFolder' },
				{ name: 'SubFolders（子文件夹）', value: 'SubFolders' },
			],
			description: FieldDescriptions.navigation,
			hint: FieldHints.navigation,
		},
		{
			displayName: 'Custom Navigation Property',
			name: 'customNavigationProperty',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'SubFolders',
			displayOptions: {
				show: {
					navigationProperty: ['custom'],
				},
			},
			description: FieldDescriptions.customNavigation,
			hint: FieldHints.navigation,
		},
	],
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolveDataAdminEntitySet(this, index, 'Folders');
		const id = String(this.getNodeParameter('id', index, '') || '').trim();
		if (!id) {
			throw new NodeOperationError(this.getNode(), 'Entity ID (OID) cannot be empty', {
				itemIndex: index,
			});
		}

		let url = ODataUtils.buildEntityUrl(`/DataAdmin/${entitySet}`, id);
		const nav = String(this.getNodeParameter('navigationProperty', index, '') || '').trim();
		if (nav === 'custom') {
			const customNav = String(this.getNodeParameter('customNavigationProperty', index, '') || '')
				.trim()
				.replace(/^\/+|\/+$/g, '');
			if (!customNav) {
				throw new NodeOperationError(this.getNode(), 'Custom Navigation Property cannot be empty', {
					itemIndex: index,
				});
			}
			url = `${url}/${customNav}`;
		} else if (nav) {
			url = `${url}/${nav}`;
		}

		return url;
	},
});

export default GetOperate;
