import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolvePartsListEntitySetPath } from './shared/entitySets';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'partList:delete',
	description: '删除 PartListMgmt 域中的零件清单或清单项实体',
	order: 50,
	idParam: {
		displayName: 'ID',
		name: 'id',
		required: true,
		placeholder: 'OR:com.ptc.windchill.partslist.PartsList:12345',
		description: '要删除的零件清单实体唯一标识符（OID）',
	},
	extraProperties: createEntitySetProperties('PartLists'),
	path(this: IExecuteFunctions, index: number): string {
		return resolvePartsListEntitySetPath(this, index);
	},
});

export default DeleteOperate;
