import { IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import {
	buildPrincipalMgmtEntitySetProperties,
	resolvePrincipalMgmtEntitySet,
} from './common/entitySets';

const DeleteOperate: ResourceOperations = WindchillOperationFactory.createEntityDeleteOperate({
	name: '删除实体 (Delete)',
	value: 'principalMgmt:delete',
	description: '删除 PrincipalMgmt 实体（适用于 Teams、TeamMembers 等）',
	order: 50,
	extraProperties: buildPrincipalMgmtEntitySetProperties('Teams'),
	idParam: {
		displayName: 'Entity ID (OID)',
		placeholder: 'OR:wt.team.Team:12345',
		description: '要删除的 PrincipalMgmt 实体唯一标识符（OID）',
	},
	path(this: IExecuteFunctions, index: number): string {
		const entitySet = resolvePrincipalMgmtEntitySet(this, index, 'Teams');
		return `/PrincipalMgmt/${entitySet}`;
	},
});

export default DeleteOperate;
