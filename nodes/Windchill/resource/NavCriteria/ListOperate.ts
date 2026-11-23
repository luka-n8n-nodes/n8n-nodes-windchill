import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildNavCriteriaEntitySetProperties,
	resolveNavCriteriaEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityListOperate({
	name: '获取导航条件列表 (List)',
	value: 'navigationCriteria:list',
	order: 10,
	description: '分页查询 NavCriteria 域下的实体集列表（支持 Return All 与 Limit）',
	extraProperties: buildNavCriteriaEntitySetProperties('NavigationCriterias'),
	path(this: IExecuteFunctions, index: number) {
		return resolveNavCriteriaEntitySetPath(this, index, 'NavigationCriterias');
	},
});

export default operate;
