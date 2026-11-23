import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetDynamicStructureRepresentationOperate: ResourceOperations =
	WindchillOperationFactory.createFunctionOperate({
		name: '获取动态结构表示 URL (GetDynamicStructureRepresentation)',
		value: 'prodMgmt:getDynamicStructureRepresentation',
		description:
			"获取零件的动态结构表示 URL (Parts('{OID}')/PTC.ProdMgmt.GetDynamicStructureRepresentation)",
		order: 80,
		idParam: {
			displayName: 'Part ID (OID)',
			placeholder: 'OR:wt.part.WTPart:12345',
			description: '零件唯一标识符（OID）',
		},
		path: '/ProdMgmt/Parts',
		functionName: 'PTC.ProdMgmt.GetDynamicStructureRepresentation',
	});

export default GetDynamicStructureRepresentationOperate;
