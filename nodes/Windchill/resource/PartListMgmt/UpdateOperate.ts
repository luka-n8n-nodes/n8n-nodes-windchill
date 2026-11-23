import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolvePartsListEntitySetPath } from './shared/entitySets';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新实体 (Update)',
	value: 'partList:update',
	description: '更新 PartListMgmt 域中的零件清单或清单项实体',
	order: 40,
	method: 'PATCH',
	idParam: {
		displayName: 'ID',
		name: 'id',
		required: true,
		placeholder: 'OR:com.ptc.windchill.partslist.PartsList:12345',
		description: '要更新的零件清单实体唯一标识符（OID）',
	},
	extraProperties: createEntitySetProperties('PartLists'),
	includeJsonBody: true,
	bodyRequired: true,
	path(this: IExecuteFunctions, index: number): string {
		return resolvePartsListEntitySetPath(this, index);
	},
});

export default UpdateOperate;
