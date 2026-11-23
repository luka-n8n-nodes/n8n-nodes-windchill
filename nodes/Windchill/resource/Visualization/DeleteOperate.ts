import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolveVisualizationEntitySetPath } from './shared/entitySets';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'visualization:delete',
	description: '删除 Visualization 域中的缩略图或实体（支持 Thumbnails、SmallThumbnails 或自定义）',
	order: 30,
	idParam: {
		displayName: 'ID',
		name: 'id',
		required: true,
		placeholder: 'OR:wt.viewmarkup.DerivedImage:12345',
		description: '要删除的缩略图或可视化实体唯一标识符（OID）',
	},
	extraProperties: createEntitySetProperties('Thumbnails'),
	path(this: IExecuteFunctions, index: number): string {
		return resolveVisualizationEntitySetPath(this, index);
	},
});

export default DeleteOperate;
