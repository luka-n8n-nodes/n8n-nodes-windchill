import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetDynamicStructurePVZOperate: ResourceOperations =
	WindchillOperationFactory.createBinaryDownloadOperate({
		name: '下载动态结构 PVZ (GetDynamicStructurePVZ)',
		value: 'prodMgmt:getDynamicStructurePVZ',
		description:
			"下载零件动态结构 PVZ 二进制文件 (Parts('{OID}')/PTC.ProdMgmt.GetDynamicStructurePVZ)",
		order: 90,
		idParam: {
			displayName: 'Part ID (OID)',
			placeholder: 'OR:wt.part.WTPart:12345',
			description: '零件唯一标识符（OID）',
		},
		path: '/ProdMgmt/Parts',
		subPath: 'PTC.ProdMgmt.GetDynamicStructurePVZ',
		defaultFileName: 'structure.pvz',
		defaultMimeType: 'application/octet-stream',
	});

export default GetDynamicStructurePVZOperate;
