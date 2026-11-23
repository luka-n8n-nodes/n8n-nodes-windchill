import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { Windchill } = require('../dist/nodes/Windchill/Windchill.node.js');
const { WindchillBasicApi } = require('../dist/credentials/WindchillBasicApi.credentials.js');
const { WindchillTokenApi } = require('../dist/credentials/WindchillTokenApi.credentials.js');
const RequestUtils = require('../dist/nodes/help/utils/RequestUtils.js').default;
const ODataUtils = require('../dist/nodes/help/utils/ODataUtils.js').default;
const ResourceFactory = require('../dist/nodes/help/builder/ResourceFactory.js').default;
const { Credentials } = require('../dist/nodes/help/type/enums.js');
const path = require('node:path');

const EXPECTED_RESOURCES = [
	'ProdMgmt',
	'DocMgmt',
	'CADDocumentMgmt',
	'DynamicDocMgmt',
	'Visualization',
	'ClfStructure',
	'ProdPlatformMgmt',
	'PartListMgmt',
	'ChangeMgmt',
	'Workflow',
	'EventMgmt',
	'PrincipalMgmt',
	'DataAdmin',
	'PTC',
	'NavCriteria',
	'OData',
];

const PAGINATED_NON_LIST_OPS = [
	'workflow:getWorkItems',
	'clfStructure:getChildNodes',
	'partList:executeFunction',
	'odata:customRequest',
];

function createMockContext({
	params = {},
	items = [{ json: { id: 'item-0' } }],
	credentialsByType = {},
	httpRequestImpl,
	httpRequestWithAuthenticationImpl,
	prepareBinaryDataImpl,
	continueOnFailValue = false,
} = {}) {
	const fakeNode = {
		id: 'windchill-test-node',
		name: 'Windchill',
		type: 'n8n-nodes-windchill.windchill',
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};

	return {
		getNode: () => fakeNode,
		getInputData: () => items,
		continueOnFail: () => continueOnFailValue,
		getNodeParameter(name, itemIndex = 0, fallbackValue) {
			const itemParams = Array.isArray(params) ? params[itemIndex] : params;
			if (itemParams && Object.prototype.hasOwnProperty.call(itemParams, name)) {
				return itemParams[name];
			}
			return fallbackValue;
		},
		async getCredentials(type) {
			if (credentialsByType[type]) {
				return credentialsByType[type];
			}
			throw new Error(`Unexpected credential type requested: ${type}`);
		},
		logger: {
			debug: () => {},
			info: () => {},
			warn: () => {},
			error: () => {},
		},
		helpers: {
			httpRequest:
				httpRequestImpl ||
				(async () => {
					throw new Error('httpRequest mock not provided');
				}),
			httpRequestWithAuthentication:
				httpRequestWithAuthenticationImpl ||
				(async () => {
					throw new Error('httpRequestWithAuthentication mock not provided');
				}),
			prepareBinaryData:
				prepareBinaryDataImpl ||
				(async (buffer, fileName, mimeType) => ({
					data: buffer.toString('base64'),
					fileName,
					mimeType,
					fileSize: String(buffer.length),
				})),
			returnJsonArray(data) {
				const arr = Array.isArray(data) ? data : [data];
				return arr.map((json) => ({ json }));
			},
			constructExecutionMetaData(executionData, { itemData }) {
				return executionData.map((d) => ({ ...d, pairedItem: itemData }));
			},
		},
	};
}

test('a) All 16 resources and all operations load with valid unique values and call handlers', () => {
	const node = new Windchill();
	const desc = node.description;

	assert.equal(desc.displayName, 'Windchill');
	assert.equal(desc.name, 'windchill');
	assert.equal(desc.usableAsTool, true);

	const resourceProp = desc.properties.find((p) => p.name === 'resource');
	assert.ok(resourceProp, 'resource property must exist');

	const loadedResources = resourceProp.options.map((o) => o.value);
	assert.equal(loadedResources.length, 16, 'must expose exactly 16 resources');
	assert.deepEqual(new Set(loadedResources), new Set(EXPECTED_RESOURCES));

	const builder = ResourceFactory.build(
		path.resolve(process.cwd(), 'dist/nodes/Windchill'),
	);

	const opSelectors = desc.properties.filter((p) => p.name === 'operation');
	assert.equal(opSelectors.length, 16, 'each of the 16 resources must have an operation selector');

	const globalOpValues = new Set();
	let totalOperations = 0;

	for (const resValue of loadedResources) {
		const opSelector = opSelectors.find((p) => p.displayOptions?.show?.resource?.includes(resValue));
		assert.ok(opSelector, `missing operation selector for resource ${resValue}`);
		assert.ok(opSelector.options.length > 0, `resource ${resValue} must have at least 1 operation`);

		const localOpValues = new Set();
		for (const opOpt of opSelector.options) {
			totalOperations += 1;
			assert.ok(opOpt.value && typeof opOpt.value === 'string', 'operation value must be non-empty string');
			assert.ok(!localOpValues.has(opOpt.value), `duplicate operation value ${opOpt.value} in ${resValue}`);
			assert.ok(!globalOpValues.has(opOpt.value), `globally duplicate operation value ${opOpt.value}`);
			localOpValues.add(opOpt.value);
			globalOpValues.add(opOpt.value);

			const opImpl = builder.getOperation(resValue, opOpt.value);
			assert.ok(opImpl, `ResourceBuilder missing implementation for ${resValue}.${opOpt.value}`);
			assert.ok(
				typeof opImpl.call === 'function' || typeof opImpl.executeAll === 'function',
				`${resValue}.${opOpt.value} must have call or executeAll function`,
			);
		}
	}

	assert.equal(totalOperations, 100, 'expected 100 total operations across 16 resources');
});

test('b) Every operation across all 16 resources exposes options with batching and timeout', () => {
	const node = new Windchill();
	const props = node.description.properties;
	const opSelectors = props.filter((p) => p.name === 'operation');

	let checked = 0;
	for (const opSelector of opSelectors) {
		const resValue = opSelector.displayOptions.show.resource[0];
		for (const opOpt of opSelector.options) {
			checked += 1;
			const opProps = props.filter((p) => {
				const show = p.displayOptions?.show;
				return show?.resource?.includes(resValue) && show?.operation?.includes(opOpt.value);
			});

			const optionsCollection = opProps.find((p) => p.name === 'options' && p.type === 'collection');
			assert.ok(optionsCollection, `${resValue}.${opOpt.value} must expose an "options" collection`);

			const batching = optionsCollection.options?.find((o) => o.name === 'batching');
			assert.ok(batching, `${resValue}.${opOpt.value} options must include "batching"`);
			assert.equal(batching.type, 'fixedCollection');

			const batchGroup = batching.options?.find((o) => o.name === 'batch');
			assert.ok(batchGroup, `${resValue}.${opOpt.value} batching must include "batch" group`);
			const batchSize = batchGroup.values?.find((v) => v.name === 'batchSize');
			const batchInterval = batchGroup.values?.find((v) => v.name === 'batchInterval');
			assert.ok(batchSize, `${resValue}.${opOpt.value} batching must include "batchSize"`);
			assert.equal(batchSize.default, 50);
			assert.ok(batchInterval, `${resValue}.${opOpt.value} batching must include "batchInterval"`);
			assert.equal(batchInterval.default, 1000);

			const timeout = optionsCollection.options?.find((o) => o.name === 'timeout');
			assert.ok(timeout, `${resValue}.${opOpt.value} options must include "timeout"`);
			assert.equal(timeout.default, 0);
		}
	}

	assert.equal(checked, 100);
});

test('b2) OID and OData query fields expose non-empty hint guidance', () => {
	const node = new Windchill();
	const props = node.description.properties;

	function walk(items, pathLabel, visit) {
		if (!Array.isArray(items)) return;
		for (const item of items) {
			const label = `${pathLabel}.${item.name || '?'}`;
			visit(item, label);
			if (Array.isArray(item.options)) {
				walk(item.options, label, visit);
			}
			if (Array.isArray(item.values)) {
				walk(item.values, label, visit);
			}
		}
	}

	const odataNames = new Set(['select', 'filter', 'expand', 'orderby']);
	let oidChecked = 0;
	let odataChecked = 0;
	let entitySetChecked = 0;

	walk(props, 'root', (item, label) => {
		const looksLikeOid =
			item.name === 'id' ||
			item.name === 'entityId' ||
			(/OID/i.test(item.displayName || '') && item.type === 'string');

		if (looksLikeOid && item.type === 'string') {
			assert.ok(
				typeof item.hint === 'string' && item.hint.trim().length > 0,
				`${label} (OID-like) must have non-empty hint`,
			);
			oidChecked += 1;
		}

		if (odataNames.has(item.name) && item.type === 'string') {
			assert.ok(
				typeof item.hint === 'string' && item.hint.trim().length > 0,
				`${label} (OData ${item.name}) must have non-empty hint`,
			);
			odataChecked += 1;
		}

		if (item.name === 'entitySet' || item.name === 'customEntitySet') {
			assert.ok(
				typeof item.hint === 'string' && item.hint.trim().length > 0,
				`${label} must have non-empty hint`,
			);
			entitySetChecked += 1;
		}
	});

	assert.ok(oidChecked > 0, 'expected at least one OID-like field with hint');
	assert.ok(odataChecked > 0, 'expected at least one OData query option with hint');
	assert.ok(entitySetChecked > 0, 'expected at least one entitySet field with hint');
});

test('c) Every list and paginated operation exposes unified returnAll and limit parameters', () => {
	const node = new Windchill();
	const props = node.description.properties;
	const opSelectors = props.filter((p) => p.name === 'operation');

	const checkedOps = [];
	for (const opSelector of opSelectors) {
		const resValue = opSelector.displayOptions.show.resource[0];
		for (const opOpt of opSelector.options) {
			const isPaginated =
				opOpt.value.endsWith(':list') || PAGINATED_NON_LIST_OPS.includes(opOpt.value);
			if (!isPaginated) continue;

			checkedOps.push(opOpt.value);
			const opProps = props.filter((p) => {
				const show = p.displayOptions?.show;
				return show?.resource?.includes(resValue) && show?.operation?.includes(opOpt.value);
			});

			const returnAll = opProps.find((p) => p.name === 'returnAll');
			assert.ok(returnAll, `${opOpt.value} must expose returnAll`);
			assert.equal(returnAll.type, 'boolean');
			assert.equal(returnAll.default, false, `${opOpt.value} returnAll default must be false`);

			const limit = opProps.find((p) => p.name === 'limit');
			assert.ok(limit, `${opOpt.value} must expose limit`);
			assert.equal(limit.type, 'number');
			assert.equal(limit.default, 50, `${opOpt.value} limit default must be 50`);
			assert.deepEqual(
				limit.displayOptions?.show?.returnAll,
				[false],
				`${opOpt.value} limit must show when returnAll is [false]`,
			);

			if (opOpt.value === 'partList:executeFunction') {
				assert.deepEqual(returnAll.displayOptions?.show?.enablePagination, [true]);
				assert.deepEqual(limit.displayOptions?.show?.enablePagination, [true]);
			}
			if (opOpt.value === 'odata:customRequest') {
				assert.deepEqual(returnAll.displayOptions?.show?.method, ['GET']);
				assert.deepEqual(limit.displayOptions?.show?.method, ['GET']);
			}
		}
	}

	assert.equal(checkedOps.length, 19, 'expected 15 *:list + 4 paginated operations = 19');
});

test('d.1) ODataUtils.executePaginatedQuery: returnAll=true via @odata.nextLink (absolute & relative)', async () => {
	const calls = [];
	const ctx = createMockContext({
		params: { authentication: Credentials.WindchillBasicApi },
		credentialsByType: {
			[Credentials.WindchillBasicApi]: {
				baseURL: 'https://wc.example.com/Windchill/servlet/odata/',
				apiVersion: 'v5',
			},
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			calls.push({ baseURL: opts.baseURL, url: opts.url, qs: opts.qs });
			if (calls.length === 1) {
				return {
					value: [{ ID: '1' }, { ID: '2' }],
					'@odata.nextLink': 'https://wc.example.com/Windchill/servlet/odata/v5/ProdMgmt/Parts?$skiptoken=p2',
				};
			}
			if (calls.length === 2) {
				return {
					value: [{ ID: '3' }],
					'@odata.nextLink': '/Windchill/servlet/odata/v5/ProdMgmt/Parts?$skiptoken=p3',
				};
			}
			return { value: [{ ID: '4' }] };
		},
	});

	const rows = await ODataUtils.executePaginatedQuery.call(ctx, {
		url: '/ProdMgmt/Parts',
		returnAll: true,
		qs: { $select: 'ID' },
	});

	assert.equal(rows.length, 4);
	assert.deepEqual(
		rows.map((r) => r.ID),
		['1', '2', '3', '4'],
	);
	assert.equal(calls.length, 3);
	assert.equal(calls[0].baseURL, 'https://wc.example.com/Windchill/servlet/odata');
	assert.equal(calls[0].url, '/v5/ProdMgmt/Parts');
	assert.deepEqual(calls[0].qs, { $select: 'ID', $top: 100 });
	// Absolute @odata.nextLink preserves full URL and clears qs
	assert.equal(calls[1].baseURL, undefined);
	assert.equal(
		calls[1].url,
		'https://wc.example.com/Windchill/servlet/odata/v5/ProdMgmt/Parts?$skiptoken=p2',
	);
	assert.equal(calls[1].qs, undefined);
	// Server-relative @odata.nextLink uses origin as baseURL and avoids duplicating /Windchill/servlet/odata
	assert.equal(calls[2].baseURL, 'https://wc.example.com');
	assert.equal(calls[2].url, '/Windchill/servlet/odata/v5/ProdMgmt/Parts?$skiptoken=p3');
	assert.equal(calls[2].qs, undefined);
});

test('d.2) ODataUtils.executePaginatedQuery: returnAll=true via $top/$skip fallback', async () => {
	const calls = [];
	const ctx = createMockContext({
		params: { authentication: Credentials.WindchillBasicApi },
		credentialsByType: {
			[Credentials.WindchillBasicApi]: {
				baseURL: 'https://wc.example.com/Windchill/servlet/odata',
			},
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			calls.push({ url: opts.url, qs: opts.qs });
			const skip = opts.qs?.$skip ?? 0;
			if (skip === 0) {
				return { value: Array.from({ length: 100 }, (_, i) => ({ idx: i })) };
			}
			return { value: Array.from({ length: 25 }, (_, i) => ({ idx: 100 + i })) };
		},
	});

	const rows = await ODataUtils.executePaginatedQuery.call(ctx, {
		url: '/ProdMgmt/Parts',
		returnAll: true,
	});

	assert.equal(rows.length, 125);
	assert.equal(calls.length, 2);
	assert.deepEqual(calls[0].qs, { $top: 100 });
	assert.deepEqual(calls[1].qs, { $top: 100, $skip: 100 });
});

test('d.3) ODataUtils.executePaginatedQuery: returnAll=false with limit <= 100 and limit > 100', async () => {
	// Case 1: limit = 30 (<= 100)
	const callsSmall = [];
	const ctxSmall = createMockContext({
		params: { authentication: Credentials.WindchillBasicApi },
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			callsSmall.push(opts.qs);
			return { value: Array.from({ length: 50 }, (_, i) => ({ idx: i })) };
		},
	});

	const smallRows = await ODataUtils.executePaginatedQuery.call(ctxSmall, {
		url: '/ProdMgmt/Parts',
		returnAll: false,
		limit: 30,
	});
	assert.equal(smallRows.length, 30);
	assert.equal(callsSmall.length, 1);
	assert.deepEqual(callsSmall[0], { $top: 30 });

	// Case 2: limit = 150 (> 100)
	const callsLarge = [];
	const ctxLarge = createMockContext({
		params: { authentication: Credentials.WindchillBasicApi },
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			callsLarge.push(opts.qs);
			if (callsLarge.length === 1) {
				return { value: Array.from({ length: 100 }, (_, i) => ({ idx: i })) };
			}
			return { value: Array.from({ length: 50 }, (_, i) => ({ idx: 100 + i })) };
		},
	});

	const largeRows = await ODataUtils.executePaginatedQuery.call(ctxLarge, {
		url: '/ProdMgmt/Parts',
		returnAll: false,
		limit: 150,
	});
	assert.equal(largeRows.length, 150);
	assert.equal(callsLarge.length, 2);
	assert.deepEqual(callsLarge[0], { $top: 100 });
	assert.deepEqual(callsLarge[1], { $top: 50, $skip: 100 });
});

test('d.4) RequestUtils.request: BasicAuth vs TokenApi (extraHeaders, allowUnauthorizedCerts, apiVersion)', async () => {
	// Basic Auth
	let capturedBasic;
	const basicCtx = createMockContext({
		params: {
			authentication: Credentials.WindchillBasicApi,
			options: { timeout: 5000, apiVersion: 'v6' },
		},
		credentialsByType: {
			[Credentials.WindchillBasicApi]: {
				baseURL: 'https://wc.example.com/Windchill/servlet/odata/',
				apiVersion: 'v5',
				allowUnauthorizedCerts: true,
			},
		},
		httpRequestWithAuthenticationImpl: async (credType, opts) => {
			capturedBasic = { credType, opts };
			return { ok: true };
		},
	});

	const basicRes = await RequestUtils.request.call(basicCtx, {
		method: 'GET',
		url: '/ProdMgmt/Parts',
	});
	assert.deepEqual(basicRes, { ok: true });
	assert.equal(capturedBasic.credType, Credentials.WindchillBasicApi);
	assert.equal(capturedBasic.opts.baseURL, 'https://wc.example.com/Windchill/servlet/odata');
	assert.equal(capturedBasic.opts.url, '/v6/ProdMgmt/Parts');
	assert.equal(capturedBasic.opts.skipSslCertificateValidation, true);
	assert.equal(capturedBasic.opts.timeout, 5000);

	// Token Api: unified path uses httpRequestWithAuthentication (credential.authenticate injects headers)
	let capturedToken;
	const tokenCtx = createMockContext({
		params: {
			authentication: Credentials.WindchillTokenApi,
		},
		credentialsByType: {
			[Credentials.WindchillTokenApi]: {
				baseURL: 'https://wc.example.com/Windchill/servlet/odata',
				apiVersion: 'v5',
				headerName: 'X-WC-Token',
				headerValue: 'secret-abc',
				extraHeaders: '{"Cookie":"JSESSIONID=xyz","X-Custom":123}',
				allowUnauthorizedCerts: false,
			},
		},
		httpRequestWithAuthenticationImpl: async (credType, opts) => {
			capturedToken = { credType, opts };
			return { ok: 'token' };
		},
	});

	const tokenRes = await RequestUtils.request.call(tokenCtx, {
		method: 'GET',
		url: '/DocMgmt/Documents',
	});
	assert.deepEqual(tokenRes, { ok: 'token' });
	assert.equal(capturedToken.credType, Credentials.WindchillTokenApi);
	assert.equal(capturedToken.opts.url, '/v5/DocMgmt/Documents');
	assert.equal(capturedToken.opts.skipSslCertificateValidation, false);

	// Credential authenticate still applies headerName / extraHeaders
	const tokenCred = new WindchillTokenApi();
	const authed = await tokenCred.authenticate(
		{
			headerName: 'X-WC-Token',
			headerValue: 'secret-abc',
			extraHeaders: '{"Cookie":"JSESSIONID=xyz","X-Custom":123}',
		},
		{ headers: {} },
	);
	assert.equal(authed.headers['X-WC-Token'], 'secret-abc');
	assert.equal(authed.headers.Cookie, 'JSESSIONID=xyz');
	assert.equal(authed.headers['X-Custom'], '123');
});

test('d.5) RequestUtils.request: auto GetCSRFToken on POST/PATCH/PUT/DELETE, 412 refresh & retry, skipNonce, manualNonce', async () => {
	for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
		const calls = [];
		let nonceCount = 0;
		const ctx = createMockContext({
			params: { authentication: Credentials.WindchillBasicApi },
			credentialsByType: {
				[Credentials.WindchillBasicApi]: {
					baseURL: 'https://wc.example.com/Windchill/servlet/odata',
				},
			},
			httpRequestWithAuthenticationImpl: async (_credType, opts) => {
				calls.push({ method: opts.method, url: opts.url, headers: { ...opts.headers } });
				if (opts.url.includes('GetCSRFToken')) {
					nonceCount += 1;
					return { NonceKey: 'CSRF_NONCE', NonceValue: `nonce-${nonceCount}` };
				}
				if (calls.filter((c) => c.method === method).length === 1) {
					const err = new Error('Precondition Failed');
					err.statusCode = 412;
					throw err;
				}
				return { retried: true, method };
			},
		});

		const res = await RequestUtils.request.call(ctx, {
			method,
			url: '/ProdMgmt/Parts',
			body: { Name: 'Bolt' },
		});

		assert.deepEqual(res, { retried: true, method });
		assert.equal(calls.length, 4, `${method} should fetch nonce, fail 412, refresh nonce, and retry`);
		assert.equal(calls[0].url, '/PTC/GetCSRFToken()');
		assert.equal(calls[1].headers.CSRF_NONCE, 'nonce-1');
		assert.equal(calls[2].url, '/PTC/GetCSRFToken()');
		assert.equal(calls[3].headers.CSRF_NONCE, 'nonce-2');
	}

	// skipNonce
	const skipCalls = [];
	const skipCtx = createMockContext({
		params: {
			authentication: Credentials.WindchillBasicApi,
			options: { skipNonce: true },
		},
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			skipCalls.push(opts);
			return { skipped: true };
		},
	});
	await RequestUtils.request.call(skipCtx, { method: 'POST', url: '/ProdMgmt/Parts', body: {} });
	assert.equal(skipCalls.length, 1);
	assert.equal(skipCalls[0].headers.CSRF_NONCE, undefined);

	// manualNonce (no GetCSRFToken call, and 412 does NOT auto-retry when manualNonce is provided)
	const manualCalls = [];
	const manualCtx = createMockContext({
		params: {
			authentication: Credentials.WindchillBasicApi,
			options: { manualNonce: 'fixed-nonce' },
		},
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			manualCalls.push(opts);
			return { manual: true };
		},
	});
	await RequestUtils.request.call(manualCtx, { method: 'PATCH', url: "/ProdMgmt/Parts('1')", body: {} });
	assert.equal(manualCalls.length, 1);
	assert.equal(manualCalls[0].headers.CSRF_NONCE, 'fixed-nonce');
});

test('d.6) Windchill.execute: executeParallel (order preservation), executeSerial, continueOnFail, and OutputType.Binary', async () => {
	const node = new Windchill();

	// Parallel execution with out-of-order resolution must preserve item order
	const parallelItems = [
		{ json: { id: 'P1' } },
		{ json: { id: 'P2' } },
		{ json: { id: 'P3' } },
	];
	const parallelCtx = createMockContext({
		items: parallelItems,
		params: [
			{
				resource: 'ProdMgmt',
				operation: 'prodMgmt:get',
				authentication: Credentials.WindchillBasicApi,
				id: 'OR:wt.part.WTPart:1',
				options: { batching: { batch: { batchSize: 10, batchInterval: 0 } } },
			},
			{
				resource: 'ProdMgmt',
				operation: 'prodMgmt:get',
				authentication: Credentials.WindchillBasicApi,
				id: 'OR:wt.part.WTPart:2',
				options: { batching: { batch: { batchSize: 10, batchInterval: 0 } } },
			},
			{
				resource: 'ProdMgmt',
				operation: 'prodMgmt:get',
				authentication: Credentials.WindchillBasicApi,
				id: 'OR:wt.part.WTPart:3',
				options: { batching: { batch: { batchSize: 10, batchInterval: 0 } } },
			},
		],
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			// Delay item 1 longest so it finishes after item 2 and 3
			const delay = opts.url.includes(':1') ? 35 : opts.url.includes(':2') ? 5 : 15;
			await new Promise((r) => setTimeout(r, delay));
			return { resolvedUrl: opts.url };
		},
	});

	const parallelOut = await node.execute.call(parallelCtx);
	assert.equal(parallelOut[0].length, 3);
	assert.deepEqual(
		parallelOut[0].map((d) => d.json.resolvedUrl),
		[
			"/ProdMgmt/Parts('OR:wt.part.WTPart:1')",
			"/ProdMgmt/Parts('OR:wt.part.WTPart:2')",
			"/ProdMgmt/Parts('OR:wt.part.WTPart:3')",
		],
	);
	assert.deepEqual(
		parallelOut[0].map((d) => d.pairedItem),
		[{ item: 0 }, { item: 1 }, { item: 2 }],
	);

	// Serial execution + continueOnFail
	const serialOrder = [];
	const serialCtx = createMockContext({
		items: [{ json: { idx: 0 } }, { json: { idx: 1 } }],
		continueOnFailValue: true,
		params: [
			{
				resource: 'ProdMgmt',
				operation: 'prodMgmt:get',
				authentication: Credentials.WindchillBasicApi,
				id: 'BAD',
				options: {},
			},
			{
				resource: 'ProdMgmt',
				operation: 'prodMgmt:get',
				authentication: Credentials.WindchillBasicApi,
				id: 'GOOD',
				options: {},
			},
		],
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			serialOrder.push(opts.url);
			if (opts.url.includes('BAD')) {
				const err = new Error('Not Found');
				err.statusCode = 404;
				err.response = { data: { error: { code: '404', message: 'Part not found' } } };
				throw err;
			}
			return { ID: 'GOOD' };
		},
	});

	const serialOut = await node.execute.call(serialCtx);
	assert.equal(serialOrder.length, 2);
	assert.match(serialOut[0][0].json.error, /Part not found/);
	assert.deepEqual(serialOut[0][0].pairedItem, { item: 0 });
	assert.equal(serialOut[0][1].json.ID, 'GOOD');
	assert.deepEqual(serialOut[0][1].pairedItem, { item: 1 });

	// OutputType.Binary handling (docMgmt:downloadContent)
	const binaryCtx = createMockContext({
		items: [{ json: {} }],
		params: {
			resource: 'DocMgmt',
			operation: 'docMgmt:downloadContent',
			authentication: Credentials.WindchillBasicApi,
			id: 'OR:wt.doc.WTDocument:99',
			contentPathMode: 'documentPrimaryContent',
			binaryPropertyName: 'attachment',
			options: {},
		},
		credentialsByType: {
			[Credentials.WindchillBasicApi]: { baseURL: 'https://wc.example.com/Windchill/servlet/odata' },
		},
		httpRequestWithAuthenticationImpl: async () => ({
			headers: {
				'content-disposition': 'attachment; filename="spec.pdf"',
				'content-type': 'application/pdf',
			},
			body: Buffer.from('PDF-CONTENT'),
		}),
	});

	const binaryOut = await node.execute.call(binaryCtx);
	assert.equal(binaryOut[0].length, 1);
	assert.equal(binaryOut[0][0].json.fileName, 'spec.pdf');
	assert.equal(binaryOut[0][0].json.mimeType, 'application/pdf');
	assert.equal(binaryOut[0][0].json.fileSize, 11);
	assert.ok(binaryOut[0][0].binary.attachment);
	assert.equal(binaryOut[0][0].binary.attachment.fileName, 'spec.pdf');
});

test('d.7) ODataUtils.executeODataBatch: multipart/mixed request serialization and response parsing', async () => {
	let capturedBatchReq;
	const ctx = createMockContext({
		params: {
			authentication: Credentials.WindchillBasicApi,
			options: { manualNonce: 'batch-nonce-1' },
		},
		credentialsByType: {
			[Credentials.WindchillBasicApi]: {
				baseURL: 'https://wc.example.com/Windchill/servlet/odata',
				apiVersion: 'v5',
			},
		},
		httpRequestWithAuthenticationImpl: async (_credType, opts) => {
			capturedBatchReq = opts;
			const respBoundary = 'batchresponse_abc';
			const changesetBoundary = 'changesetresponse_def';
			return {
				headers: {
					'content-type': `multipart/mixed; boundary=${respBoundary}`,
				},
				body: [
					`--${respBoundary}`,
					'Content-Type: application/http',
					'Content-Transfer-Encoding: binary',
					'',
					'HTTP/1.1 200 OK',
					'Content-Type: application/json',
					'',
					'{"value":[{"ID":"P1"}]}',
					`--${respBoundary}`,
					`Content-Type: multipart/mixed; boundary=${changesetBoundary}`,
					'',
					`--${changesetBoundary}`,
					'Content-Type: application/http',
					'Content-Transfer-Encoding: binary',
					'Content-ID: 2',
					'',
					'HTTP/1.1 201 Created',
					'Content-Type: application/json',
					'',
					'{"ID":"P2","Name":"Created"}',
					`--${changesetBoundary}--`,
					`--${respBoundary}--`,
					'',
				].join('\r\n'),
			};
		},
	});

	const batchResult = await ODataUtils.executeODataBatch.call(ctx, {
		useChangeset: true,
		requests: [
			{ method: 'GET', url: '/ProdMgmt/Parts?$top=1', contentId: '1' },
			{ method: 'POST', url: '/ProdMgmt/Parts', body: { Name: 'Created' }, contentId: '2' },
		],
	});

	// /$batch must NOT prepend /v5 apiVersion
	assert.equal(capturedBatchReq.url, '/$batch');
	assert.equal(capturedBatchReq.method, 'POST');
	assert.equal(capturedBatchReq.headers.CSRF_NONCE, 'batch-nonce-1');
	assert.match(capturedBatchReq.headers['Content-Type'], /^multipart\/mixed; boundary=batch_/);
	assert.match(capturedBatchReq.body, /Content-Type: multipart\/mixed; boundary=changeset_/);
	assert.match(capturedBatchReq.body, /GET ProdMgmt\/Parts\?\$top=1 HTTP\/1\.1/);
	assert.match(capturedBatchReq.body, /POST ProdMgmt\/Parts HTTP\/1\.1/);

	assert.equal(batchResult.total, 2);
	assert.equal(batchResult.responses[0].statusCode, 200);
	assert.deepEqual(batchResult.responses[0].body, { value: [{ ID: 'P1' }] });
	assert.equal(batchResult.responses[1].statusCode, 201);
	assert.equal(batchResult.responses[1].contentId, '2');
	assert.deepEqual(batchResult.responses[1].body, { ID: 'P2', Name: 'Created' });
});

test('e) Credentials: WindchillBasicApi & WindchillTokenApi authenticate semantics', async () => {
	const basic = new WindchillBasicApi();
	assert.equal(basic.name, 'windchillBasicApi');
	assert.equal(basic.authenticate.type, 'generic');
	assert.deepEqual(basic.authenticate.properties.auth, {
		username: '={{$credentials.username}}',
		password: '={{$credentials.password}}',
	});

	const token = new WindchillTokenApi();
	assert.equal(token.name, 'windchillTokenApi');
	// Uses programmatic IAuthenticate function rather than invalid dynamic property key in IAuthenticateGeneric
	assert.equal(typeof token.authenticate, 'function');

	const authed = await token.authenticate(
		{
			headerName: 'X-Custom-Auth',
			headerValue: 'Bearer tok-123',
			extraHeaders: '{"X-Env":"prod","Cookie":"JSESSIONID=1"}',
		},
		{ url: '/' },
	);

	assert.equal(authed.headers['X-Custom-Auth'], 'Bearer tok-123');
	assert.equal(authed.headers['X-Env'], 'prod');
	assert.equal(authed.headers.Cookie, 'JSESSIONID=1');

	await assert.rejects(
		() =>
			token.authenticate(
				{
					headerName: 'Authorization',
					headerValue: 'Bearer x',
					extraHeaders: '{invalid json',
				},
				{ url: '/' },
			),
		/Extra Headers JSON/,
	);
});
