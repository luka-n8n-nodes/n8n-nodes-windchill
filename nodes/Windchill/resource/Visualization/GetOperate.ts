import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';
import { createEntitySetProperties, resolveVisualizationEntitySetPath } from './shared/entitySets';

const GetOperate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取详情 (Get)',
	value: 'visualization:get',
	description: '根据 OID 获取单个 Visualization 域实体详情',
	order: 20,
	idParam: false,
	extraProperties: [
		...createEntitySetProperties('Representations'),
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'OR:wt.representation.Representation:12345',
			description: FieldDescriptions.oid,
			hint: FieldHints.oid,
		},
	],
	path(this: IExecuteFunctions, index: number): string {
		const entitySetPath = resolveVisualizationEntitySetPath(this, index);
		const id = String(this.getNodeParameter('id', index, '')).trim();
		return ODataUtils.buildEntityUrl(entitySetPath, id);
	},
});

export default GetOperate;
