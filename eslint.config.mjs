import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

export default [
	...configWithoutCloudSupport,
	{
		files: ['package.json'],
		rules: {
			// 社区节点：允许本包运行时无额外依赖（已移除 glob/form-data）
			'@n8n/community-nodes/no-runtime-dependencies': 'error',
		},
	},
	{
		files: ['**/*.ts'],
		rules: {
			// 保留少量现实约束放宽项
			'@n8n/community-nodes/icon-prefer-themed-variants': 'off',
			'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
			'n8n-nodes-base/node-param-collection-type-unsorted-items': 'off',
			'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',

			// 误报：allowUnauthorizedCerts 因名称含 "auth" 被识别为密码字段
			'@n8n/community-nodes/credential-password-field': 'off',
			// 误报：default 使用枚举常量 / 表达式时规则无法静态识别
			'n8n-nodes-base/node-param-default-missing': 'off',
			// 工具层无 node 上下文；execute 中再抛出的错误已由 RequestUtils 封装为 NodeApiError
			'@n8n/community-nodes/require-node-api-error': 'off',

			// TypeScript：逐步收紧，先保持可用
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
];
