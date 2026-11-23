import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RequestUtils = require('../dist/nodes/help/utils/RequestUtils.js').default;
const { assertSafePathSegment } = require('../dist/nodes/help/utils/WindchillConstants.js');

test('resolveRequestUrl rejects cross-origin absolute URLs', () => {
	assert.throws(
		() =>
			RequestUtils.resolveRequestUrl(
				'https://wc.example.com/Windchill/servlet/odata',
				'https://evil.example/steal',
			),
		/different origin/,
	);
});

test('resolveRequestUrl allows same-origin absolute nextLink', () => {
	const resolved = RequestUtils.resolveRequestUrl(
		'https://wc.example.com/Windchill/servlet/odata',
		'https://wc.example.com/Windchill/servlet/odata/v5/ProdMgmt/Parts?$skiptoken=1',
	);
	assert.equal(resolved.baseURL, undefined);
	assert.match(resolved.url, /^https:\/\/wc\.example\.com\//);
});

test('assertSafePathSegment blocks path traversal', () => {
	assert.throws(() => assertSafePathSegment('../etc/passwd', 'Entity Set'), /illegal/);
	assert.equal(assertSafePathSegment('Parts'), 'Parts');
});

test('buildEntityUrl rejects injected path keys', () => {
	const ODataUtils = require('../dist/nodes/help/utils/ODataUtils.js').default;
	assert.throws(
		() => ODataUtils.buildEntityUrl('/ProdMgmt/Parts', "('OR:x')/../../Admin"),
		/Invalid OData entity key/,
	);
});
