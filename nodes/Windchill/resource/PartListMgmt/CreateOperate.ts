import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolvePartsListEntitySetPath } from './shared/entitySets';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'partList:create',
	description: '在 PartListMgmt 域中创建零件清单、清单项或清单内容实体',
	order: 30,
	extraProperties: createEntitySetProperties('PartLists'),
	includeJsonBody: true,
	bodyRequired: true,
	bodyDescription: '请求体 JSON 数据（支持标准属性与 @odata.bind 关联）',
	path(this: IExecuteFunctions, index: number): string {
		return resolvePartsListEntitySetPath(this, index);
	},
});

export default CreateOperate;
