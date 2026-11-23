import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildNavCriteriaEntitySetProperties,
	resolveNavCriteriaEntitySetPath,
} from './shared/entitySet';

const operate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建导航条件 (Create)',
	value: 'navigationCriteria:create',
	order: 30,
	description: '在 NavCriteria 域下创建导航条件或配置规范',
	extraProperties: buildNavCriteriaEntitySetProperties('NavigationCriterias'),
	fields: [
		{
			displayName: 'Name',
			name: 'Name',
			type: 'string',
			default: '',
			description: '导航条件名称',
		},
		{
			displayName: 'Description',
			name: 'Description',
			type: 'string',
			default: '',
			description: '导航条件描述',
		},
	],
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription:
		'附加字段 JSON（如配置规范、基线、生命周期状态过滤条件等），将与上方表单字段合并发送',
	path(this: IExecuteFunctions, index: number) {
		return resolveNavCriteriaEntitySetPath(this, index, 'NavigationCriterias');
	},
});

export default operate;
