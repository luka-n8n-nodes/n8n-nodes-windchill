import { IExecuteFunctions, IHttpRequestMethods, NodeOperationError } from 'n8n-workflow';
import { WRITE_HTTP_METHODS } from '../../../help/type/enums';
import { OperationResult, ResourceOperations } from '../../../help/type/IResource';
import NodeUtils from '../../../help/utils/NodeUtils';
import ODataUtils, { IODataBatchRequestItem } from '../../../help/utils/ODataUtils';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	apiVersionOption,
	createCommonOptions,
	ICommonOptionsValue,
	manualNonceOption,
	skipNonceOption,
} from '../../../help/utils/sharedOptions';
import { CSRF_NONCE_HEADER, WindchillDomains } from '../../../help/utils/WindchillConstants';
import { buildDomainProperties, resolveDomain } from './common/domains';

const ExecuteBatchOperate: ResourceOperations = {
	name: '执行批处理请求 (ExecuteBatch)',
	value: 'odata:executeBatch',
	action: '执行批处理请求 (ExecuteBatch)',
	description:
		'执行原生 OData POST /{Domain}/$batch 复合请求（自动处理外层与写子请求的 CSRF_NONCE 令牌）',
	order: 40,
	options: [
		...buildDomainProperties(WindchillDomains.ProdMgmt),
		{
			displayName: 'Sub-Requests (JSON)',
			name: 'requests',
			type: 'json',
			required: true,
			default: '[\n  {\n    "method": "GET",\n    "url": "/ProdMgmt/Parts?$top=5"\n  }\n]',
			description: 'OData $batch 子请求数组 JSON，每项包含 method、URL、headers、body、contentId',
		},
		{
			displayName: 'Use Changeset',
			name: 'useChangeset',
			type: 'boolean',
			default: false,
			description: 'Whether to wrap sub-requests inside an atomic OData changeset',
		},
		createCommonOptions([
			{
				displayName: 'Auto-Inject CSRF_NONCE for Write Sub-Requests',
				name: 'injectSubRequestNonce',
				type: 'boolean',
				default: true,
				description:
					'Whether to automatically inject CSRF_NONCE headers into write sub-requests (POST/PATCH/PUT/DELETE) missing the header',
			},
			apiVersionOption,
			skipNonceOption,
			manualNonceOption,
		]),
	],
	async call(this: IExecuteFunctions, index: number): Promise<OperationResult> {
		const domain = resolveDomain(this, index, WindchillDomains.ProdMgmt);
		const rawRequests = NodeUtils.getNodeJsonData<unknown>(this, 'requests', index, []);
		if (!Array.isArray(rawRequests) || rawRequests.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'Sub-Requests (JSON) must be a non-empty array',
				{ itemIndex: index },
			);
		}

		const useChangeset = this.getNodeParameter('useChangeset', index, false) as boolean;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue & {
			injectSubRequestNonce?: boolean;
		};

		const normalizedRequests: IODataBatchRequestItem[] = rawRequests.map((item, idx) => {
			if (!item || typeof item !== 'object' || Array.isArray(item)) {
				throw new NodeOperationError(
					this.getNode(),
					`Batch sub-request at index ${idx} must be an object`,
					{ itemIndex: index },
				);
			}

			const obj = item as Record<string, unknown>;
			const method = String(obj.method || 'GET').toUpperCase() as IHttpRequestMethods;
			const url = String(obj.url || '').trim();
			if (!url) {
				throw new NodeOperationError(
					this.getNode(),
					`Batch sub-request at index ${idx} is missing required "url"`,
					{ itemIndex: index },
				);
			}

			const headers: Record<string, string> = {};
			if (obj.headers && typeof obj.headers === 'object' && !Array.isArray(obj.headers)) {
				for (const [k, v] of Object.entries(obj.headers as Record<string, unknown>)) {
					if (v !== undefined && v !== null) {
						headers[k] = String(v);
					}
				}
			}

			return {
				method,
				url,
				...(Object.keys(headers).length > 0 ? { headers } : {}),
				...(obj.body !== undefined ? { body: obj.body as IODataBatchRequestItem['body'] } : {}),
				...(obj.contentId !== undefined ? { contentId: String(obj.contentId) } : {}),
			};
		});

		const injectSubRequestNonce = options.injectSubRequestNonce !== false;
		const hasNonceHeader = (headers?: Record<string, string>) =>
			Object.keys(headers ?? {}).some((k) => k.toLowerCase() === 'csrf_nonce' || k.toLowerCase() === 'nonce');

		const needsSubRequestNonce =
			!options.skipNonce &&
			injectSubRequestNonce &&
			normalizedRequests.some(
				(req) => WRITE_HTTP_METHODS.includes(req.method) && !hasNonceHeader(req.headers),
			);

		if (needsSubRequestNonce) {
			const subNonce =
				(typeof options.manualNonce === 'string' && options.manualNonce.trim()) ||
				(await RequestUtils.fetchNonceToken.call(this, index, options.apiVersion, options.timeout))
					.value;

			for (const req of normalizedRequests) {
				if (WRITE_HTTP_METHODS.includes(req.method) && !hasNonceHeader(req.headers)) {
					req.headers = {
						...(req.headers ?? {}),
						[CSRF_NONCE_HEADER]: subNonce,
					};
				}
			}
		}

		return ODataUtils.executeODataBatch.call(
			this,
			{
				requests: normalizedRequests,
				useChangeset,
				domain,
				apiVersion: options.apiVersion,
				skipNonce: options.skipNonce,
				manualNonce: options.manualNonce,
				timeout: options.timeout,
			},
			index,
		);
	},
};

export default ExecuteBatchOperate;
