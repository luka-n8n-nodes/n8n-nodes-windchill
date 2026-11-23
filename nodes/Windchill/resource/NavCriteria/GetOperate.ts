import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildNavCriteriaEntitySetProperties,
	resolveNavCriteriaEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityGetOperate({
	name: '获取导航条件详情 (Get)',
	value: 'navigationCriteria:get',
	order: 20,
	description: '根据 OID 获取单个导航条件或配置规范详情',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.filter.NavCriteria:12345',
		description: '导航条件或配置规范实体的 Windchill OID',
	},
	extraProperties: buildNavCriteriaEntitySetProperties('NavigationCriterias'),
	path(this: IExecuteFunctions, index: number) {
		return resolveNavCriteriaEntitySetPath(this, index, 'NavigationCriterias');
	},
});

export default operate;
