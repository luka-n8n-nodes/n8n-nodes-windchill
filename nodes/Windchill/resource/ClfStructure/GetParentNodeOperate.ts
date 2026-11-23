import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetParentNodeOperate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取父分类节点 (Get Parent Node)',
	value: 'clfStructure:getParentNode',
	description: '获取指定分类节点的父分类节点',
	order: 70,
	idParam: {
		displayName: 'Classification Node ID',
		name: 'id',
		required: true,
		placeholder: 'OR:com.ptc.windchill.csm.cls.ClassificationNode:12345',
		description: '当前分类节点的唯一标识符（OID）',
	},
	path: '/ClfStructure/ClassificationNodes',
	functionName: 'PTC.ClfStructure.GetParentNode',
	paginated: false,
});

export default GetParentNodeOperate;
