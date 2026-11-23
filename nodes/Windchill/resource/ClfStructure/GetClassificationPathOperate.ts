import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetClassificationPathOperate: ResourceOperations =
	WindchillOperationFactory.createFunctionOperate({
		name: '获取分类路径 (Get Classification Path)',
		value: 'clfStructure:getClassificationPath',
		description: '获取指定分类节点的完整分类层级路径',
		order: 80,
		idParam: {
			displayName: 'Classification Node ID',
			name: 'id',
			required: true,
			placeholder: 'OR:com.ptc.windchill.csm.cls.ClassificationNode:12345',
			description: '分类节点的唯一标识符（OID）',
		},
		path: '/ClfStructure/ClassificationNodes',
		functionName: 'PTC.ClfStructure.GetClassificationPath',
		paginated: false,
	});

export default GetClassificationPathOperate;
