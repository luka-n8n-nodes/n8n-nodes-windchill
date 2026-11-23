import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetLatestVersionOperate: ResourceOperations = WindchillOperationFactory.createFunctionOperate(
	{
		name: '获取最新版本 (GetLatestVersion)',
		value: 'prodMgmt:getLatestVersion',
		description: "获取指定零件的最新版本信息 (Parts('{OID}')/PTC.ProdMgmt.GetLatestVersion)",
		order: 100,
		idParam: {
			displayName: 'Part ID (OID)',
			placeholder: 'OR:wt.part.WTPart:12345',
			description: '零件唯一标识符（OID）',
		},
		path: '/ProdMgmt/Parts',
		functionName: 'PTC.ProdMgmt.GetLatestVersion',
	},
);

export default GetLatestVersionOperate;
