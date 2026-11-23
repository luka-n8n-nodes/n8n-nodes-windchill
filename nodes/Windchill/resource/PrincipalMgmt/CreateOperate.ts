import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildPrincipalMgmtEntitySetProperties,
	resolvePrincipalMgmtEntitySet,
} from './common/entitySets';

const CreateOperate: ResourceOperations = WindchillOperationFactory.createEntityCreateOperate({
	name: '创建实体 (Create)',
	value: 'principalMgmt:create',
	description: '创建 PrincipalMgmt 实体（适用于 Teams、TeamMembers 等）',
	order: 30,
	extraProperties: buildPrincipalMgmtEntitySetProperties('Teams'),
	bodyRequired: true,
	bodyDescription:
		'创建实体所需的 JSON 请求体（例如 Teams 或 TeamMembers 字段与 @odata.bind 关联）',
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolvePrincipalMgmtEntitySet(this, index, 'Teams');
		return `/PrincipalMgmt/${entitySet}`;
	},
});

export default CreateOperate;
