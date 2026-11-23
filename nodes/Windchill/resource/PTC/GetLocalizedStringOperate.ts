import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { formatODataFunctionCall, getJsonObjectParam } from './common/helpers';

const GetLocalizedStringOperate: ResourceOperations =
	WindchillOperationFactory.createFunctionOperate({
		name: '获取本地化字符串 (GetLocalizedString)',
		value: 'ptc:getLocalizedString',
		description: '获取 Windchill 本地化字符串 (GET /PTC/GetLocalizedString(...))',
		order: 40,
		idParam: false,
		params: [
			{
				displayName: 'Resource Bundle',
				name: 'resourceBundle',
				type: 'string',
				default: '',
				placeholder: 'wt.part.partResource',
				description: '资源包名称（作为 ResourceBundle 参数传入；留空则不包含）',
			},
			{
				displayName: 'Key',
				name: 'resourceKey',
				type: 'string',
				default: '',
				placeholder: 'PART_NAME',
				description: '资源键名（作为 Key 参数传入；留空则不包含）',
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				placeholder: 'zh-CN',
				description: '语言区域代码（作为 Locale 参数传入，例如 zh-CN、en-US；留空则不包含）',
			},
			{
				displayName: 'Additional Parameters (JSON)',
				name: 'additionalParams',
				type: 'json',
				default: '{}',
				description: '可选自定义或附加 OData 函数参数 JSON 对象（将合并或覆盖上述参数）',
			},
		],
		path(this: IExecuteFunctions, index: number): string {
			const resourceBundle = String(
				this.getNodeParameter('resourceBundle', index, '') || '',
			).trim();
			const resourceKey = String(this.getNodeParameter('resourceKey', index, '') || '').trim();
			const locale = String(this.getNodeParameter('locale', index, '') || '').trim();
			const additionalParams = getJsonObjectParam(this, 'additionalParams', index);

			const fnParams: IDataObject = {};
			if (resourceBundle) {
				fnParams.ResourceBundle = resourceBundle;
			}
			if (resourceKey) {
				fnParams.Key = resourceKey;
			}
			if (locale) {
				fnParams.Locale = locale;
			}
			Object.assign(fnParams, additionalParams);

			return formatODataFunctionCall('/PTC/GetLocalizedString', fnParams);
		},
	});

export default GetLocalizedStringOperate;
