import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildNavCriteriaEntitySetProperties,
	resolveNavCriteriaEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新导航条件 (Update)',
	value: 'navigationCriteria:update',
	order: 40,
	description: '更新指定 OID 的导航条件或配置规范属性',
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.filter.NavCriteria:12345',
		description: '待更新导航条件实体的 Windchill OID',
	},
	extraProperties: buildNavCriteriaEntitySetProperties('NavigationCriterias'),
	fields: [
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			description: '更新后的名称（留空则不修改）',
		},
		{
			displayName: 'Description',
			name: 'Description',
			type: 'string',
			default: '',
			description: '更新后的描述（留空则不修改）',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	path(this: IExecuteFunctions, index: number) {
		return resolveNavCriteriaEntitySetPath(this, index, 'NavigationCriterias');
	},
});

export default operate;
