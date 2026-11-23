import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { createEntitySetProperties, resolveVisualizationEntitySetPath } from './shared/entitySets';

const ListOperate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '列表查询 (List)',
	value: 'visualization:list',
	description: '分页查询 Visualization 域实体列表（支持 Return All 与 Limit）',
	order: 10,
	extraProperties: createEntitySetProperties('Representations'),
	path(this: IExecuteFunctions, index: number): string {
		return resolveVisualizationEntitySetPath(this, index);
	},
});

export default ListOperate;
