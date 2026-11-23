import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetPartsListOperate: ResourceOperations = WindchillOperationFactory.createActionOperate({
	name: '获取零件清单 (GetPartsList)',
	value: 'prodMgmt:getPartsList',
	description: "获取指定零件的扁平化零件清单 (POST Parts('{OID}')/PTC.ProdMgmt.GetPartsList)",
	order: 70,
	idParam: {
		displayName: 'Part ID (OID)',
		placeholder: 'OR:wt.part.WTPart:12345',
		description: '零件唯一标识符（OID）',
	},
	path: '/ProdMgmt/Parts',
	actionName: 'PTC.ProdMgmt.GetPartsList',
	includeJsonBody: true,
	bodyRequired: false,
	bodyDescription: '可选 OData Action 请求体 JSON（如 NavigationCriteria）',
});

export default GetPartsListOperate;
