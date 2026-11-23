import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
} from '../../../help/utils/sharedOptions';
import { buildDomainProperties, resolveDomain } from './common/domains';

function extractXmlNames(xml: string, tagName: string): string[] {
	const regex = new RegExp(`<${tagName}\\b[^>]*\\bName="([^"]+)"`, 'gi');
	const names = new Set<string>();
	let match: RegExpExecArray | null;
	while ((match = regex.exec(xml)) !== null) {
		if (match[1]) {
			names.add(match[1]);
		}
	}
	return Array.from(names);
}

const GetMetadataOperate: ResourceOperations = {
	name: '获取域 EDM 元数据 (GetMetadata)',
	value: 'odata:getMetadata',
	action: '获取域 EDM 元数据 (GetMetadata)',
	description: '获取指定域的 OData EDM 元数据 CSDL XML (GET /{Domain}/$metadata)',
	order: 30,
	options: [
		...buildDomainProperties('ProdMgmt'),
		createCommonOptions([
			{
				displayName: 'Parse Summary',
				name: 'parseSummary',
				type: 'boolean',
				default: false,
				description: 'Whether to extract EntitySets, EntityTypes, Functions, and Actions summary',
			},
			apiVersionOption,
		]),
	],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const domain = resolveDomain(this, index, 'ProdMgmt');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue & {
			parseSummary?: boolean;
		};

		const rawResponse = await RequestUtils.request.call(
			this,
			{
				method: 'GET',
				url: `/${domain}/$metadata`,
				headers: {
					Accept: 'application/xml, text/xml',
				},
				json: false,
				apiVersion: options.apiVersion,
				timeout: options.timeout,
			},
			index,
		);

		const metadata = Buffer.isBuffer(rawResponse)
			? rawResponse.toString('utf-8')
			: typeof rawResponse === 'string'
				? rawResponse
				: String(rawResponse ?? '');

		const result: IDataObject = {
			domain,
			metadata,
		};

		if (options.parseSummary) {
			result.summary = {
				entitySets: extractXmlNames(metadata, 'EntitySet'),
				entityTypes: extractXmlNames(metadata, 'EntityType'),
				functions: extractXmlNames(metadata, 'Function'),
				actions: extractXmlNames(metadata, 'Action'),
			};
		}

		return result;
	},
};

export default GetMetadataOperate;
