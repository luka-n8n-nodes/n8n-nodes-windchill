import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const GetNonceTokenOperate: ResourceOperations = WindchillOperationFactory.createFunctionOperate({
	name: '获取 NONCE 令牌 (GetNonceToken)',
	value: 'ptc:getNonceToken',
	description: '获取 Windchill CSRF 校验用的 NONCE 令牌 (GET /PTC/GetCSRFToken())',
	order: 20,
	idParam: false,
	path: '/PTC/GetCSRFToken()',
});

export default GetNonceTokenOperate;
