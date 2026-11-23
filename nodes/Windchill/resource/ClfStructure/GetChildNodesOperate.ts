import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetChildNodesOperate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取子分类节点 (Get Child Nodes)',
	value: 'clfStructure:getChildNodes',
	description: '获取指定分类节点的子分类节点列表（支持 Return All 与 Limit）',
	order: 60,
	idParam: {
		displayName: 'Classification Node ID',
		name: 'id',
		required: true,
		placeholder: 'OR:com.ptc.windchill.csm.cls.ClassificationNode:12345',
		description: '父分类节点的唯一标识符（OID）',
	},
	path: '/ClfStructure/ClassificationNodes',
	functionName: 'PTC.ClfStructure.GetChildNodes',
	paginated: true,
});

export default GetChildNodesOperate;
