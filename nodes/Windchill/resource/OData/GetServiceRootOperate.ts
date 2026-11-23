import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
} from '../../../help/utils/sharedOptions';

const GetServiceRootOperate: ResourceOperations = {
	name: '获取服务根目录 / 可用域 (GetServiceRoot)',
	value: 'odata:getServiceRoot',
	action: '获取服务根目录 / 可用域 (GetServiceRoot)',
	description: '获取 Windchill OData 服务根目录及所有可用域列表 (GET /)',
	order: 10,
	options: [createCommonOptions([apiVersionOption])],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const response = await RequestUtils.request.call(
			this,
			{
				method: 'GET',
				url: '/',
				apiVersion: options.apiVersion,
				timeout: options.timeout,
			},
			index,
		);

		if (response && typeof response === 'object' && Array.isArray(response.value)) {
			return response.value as IDataObject[];
		}

		return (response ?? {}) as IDataObject;
	},
};

export default GetServiceRootOperate;
