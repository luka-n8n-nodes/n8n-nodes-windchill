import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldHints } from '../../../help/utils/fieldHints';
import { formatODataFunctionCall, getJsonObjectParam } from './common/helpers';

const GetEnumerationValuesOperate: ResourceOperations =
	WindchillOperationFactory.createFunctionOperate({
		name: '获取枚举值列表 (GetEnumerationValues)',
		value: 'ptc:getEnumerationValues',
		description: '获取 Windchill 枚举值列表 (GET /PTC/GetEnumerationValues(...))',
		order: 30,
		idParam: false,
		params: [
			{
				displayName: 'Enumeration Name',
				name: 'enumerationName',
				type: 'string',
				default: '',
				placeholder: 'wt.part.Source',
				description:
					'枚举内部名称（例如 wt.part.Source）；留空时将使用下方 Additional Parameters 或无参调用',
				hint: FieldHints.enumeration,
			},
			{
				displayName: 'Enumeration Parameter Name',
				name: 'enumerationParamName',
				type: 'string',
				default: 'EnumerationName',
				description: '枚举名称对应的 OData 函数参数名（默认 EnumerationName）',
			},
			{
				displayName: 'Additional Parameters (JSON)',
				name: 'additionalParams',
				type: 'json',
				default: '{}',
				description: '可选附加或覆盖 OData 函数参数 JSON 对象（例如 {"Locale":"en-US"}）',
			},
		],
		path(this: IExecuteFunctions, index: number): string {
			const enumerationName = String(
				this.getNodeParameter('enumerationName', index, '') || '',
			).trim();
			const enumerationParamName =
				String(
					this.getNodeParameter('enumerationParamName', index, 'EnumerationName') ||
						'EnumerationName',
				).trim() || 'EnumerationName';
			const additionalParams = getJsonObjectParam(this, 'additionalParams', index);

			const fnParams: IDataObject = {};
			if (enumerationName) {
				fnParams[enumerationParamName] = enumerationName;
			}
			Object.assign(fnParams, additionalParams);

			return formatODataFunctionCall('/PTC/GetEnumerationValues', fnParams);
		},
	});

export default GetEnumerationValuesOperate;
