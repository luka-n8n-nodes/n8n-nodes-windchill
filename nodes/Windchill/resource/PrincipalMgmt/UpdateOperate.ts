import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildPrincipalMgmtEntitySetProperties,
	resolvePrincipalMgmtEntitySet,
} from './common/entitySets';

const UpdateOperate: ResourceOperations = WindchillOperationFactory.createEntityUpdateOperate({
	name: '更新实体 (Update)',
	value: 'principalMgmt:update',
	description: '更新 PrincipalMgmt 实体（适用于 Teams 等）',
	order: 40,
	extraProperties: buildPrincipalMgmtEntitySetProperties('Teams'),
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.team.Team:12345',
		description: '要更新的 PrincipalMgmt 实体唯一标识符（OID）',
	},
	bodyRequired: true,
	bodyDescription: '需要更新的实体属性 JSON 数据',
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolvePrincipalMgmtEntitySet(this, index, 'Teams');
		return `/PrincipalMgmt/${entitySet}`;
	},
});

export default UpdateOperate;
