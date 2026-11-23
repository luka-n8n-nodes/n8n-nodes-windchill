import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildNavCriteriaEntitySetProperties,
	resolveNavCriteriaEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除导航条件 (Delete)',
	value: 'navigationCriteria:delete',
	order: 50,
	description: '删除指定 OID 的导航条件或配置规范实体',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.filter.NavCriteria:12345',
		description: '待删除导航条件实体的 Windchill OID',
	},
	extraProperties: buildNavCriteriaEntitySetProperties('NavigationCriterias'),
	path(this: IExecuteFunctions, index: number) {
		return resolveNavCriteriaEntitySetPath(this, index, 'NavigationCriterias');
	},
});

export default operate;
