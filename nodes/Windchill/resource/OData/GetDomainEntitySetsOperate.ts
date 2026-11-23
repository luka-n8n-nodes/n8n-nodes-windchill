import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
} from '../../../help/utils/sharedOptions';
import { buildDomainProperties, resolveDomain } from './common/domains';

const GetDomainEntitySetsOperate: ResourceOperations = {
	name: '获取域实体集列表 (GetDomainEntitySets)',
	value: 'odata:getDomainEntitySets',
	action: '获取域实体集列表 (GetDomainEntitySets)',
	description: '获取指定 Windchill OData 域下的所有实体集列表 (GET /{Domain}/)',
	order: 20,
	options: [...buildDomainProperties('ProdMgmt'), createCommonOptions([apiVersionOption])],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const domain = resolveDomain(this, index, 'ProdMgmt');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const response = await RequestUtils.request.call(
			this,
			{
				method: 'GET',
				url: `/${domain}/`,
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

export default GetDomainEntitySetsOperate;
