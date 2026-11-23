import {
	IExecuteFunctions,
	INodeProperties,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { FieldDescriptions, FieldHints } from './fieldHints';
import { assertSafePathSegment } from './WindchillConstants';

export interface IDomainHelperConfig {
	domain: string;
	entitySets: INodePropertyOptions[];
	navigationProperties?: INodePropertyOptions[];
	defaultEntitySet?: string;
}

/**
 * 创建统一的域实体集 / 导航属性参数与解析函数
 */
export function createDomainHelper(config: IDomainHelperConfig) {
	const {
		domain,
		entitySets,
		navigationProperties,
		defaultEntitySet = String(entitySets[0]?.value ?? ''),
	} = config;

	const entitySetOptions: INodePropertyOptions[] = [
		...entitySets,
		...(entitySets.some((o) => o.value === 'custom')
			? []
			: [{ name: '自定义实体集 (Custom)', value: 'custom' }]),
	];

	function createEntitySetProperties(
		defaultValue = defaultEntitySet,
		displayOptions?: INodeProperties['displayOptions'],
	): INodeProperties[] {
		const props: INodeProperties[] = [
			{
				displayName: 'Entity Set',
				name: 'entitySet',
				type: 'options',
				options: entitySetOptions,
				default: defaultValue,
				required: true,
				description: FieldDescriptions.entitySet(domain),
				hint: FieldHints.entitySet,
				...(displayOptions ? { displayOptions } : {}),
			},
			{
				displayName: 'Custom Entity Set',
				name: 'customEntitySet',
				type: 'string',
				default: '',
				required: true,
				placeholder: defaultValue,
				displayOptions: {
					show: {
						...(displayOptions?.show ?? {}),
						entitySet: ['custom'],
					},
					...(displayOptions?.hide ? { hide: displayOptions.hide } : {}),
				},
				description: FieldDescriptions.customEntitySet(domain),
				hint: FieldHints.entitySet,
			},
		];
		return props;
	}

	function createNavigationProperties(): INodeProperties[] {
		const navOptions: INodePropertyOptions[] = navigationProperties ?? [
			{ name: '无（获取实体本身）', value: '' },
			{ name: '自定义导航属性 (Custom)', value: 'custom' },
		];
		if (!navOptions.some((o) => o.value === 'custom')) {
			navOptions.push({ name: '自定义导航属性 (Custom)', value: 'custom' });
		}
		if (!navOptions.some((o) => o.value === '')) {
			navOptions.unshift({ name: '无（获取实体本身）', value: '' });
		}

		return [
			{
				displayName: 'Navigation Property',
				name: 'navigationProperty',
				type: 'options',
				options: navOptions,
				default: '',
				description: FieldDescriptions.navigation,
				hint: FieldHints.navigation,
			},
			{
				displayName: 'Custom Navigation Property',
				name: 'customNavigationProperty',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Uses',
				displayOptions: {
					show: {
						navigationProperty: ['custom'],
					},
				},
				description: FieldDescriptions.customNavigation,
				hint: FieldHints.navigation,
			},
		];
	}

	function resolveEntitySet(
		context: IExecuteFunctions,
		index: number,
		fallback = defaultEntitySet,
	): string {
		const entitySet = String(context.getNodeParameter('entitySet', index, fallback) || '').trim();
		if (entitySet === 'custom') {
			const custom = String(context.getNodeParameter('customEntitySet', index, '') || '').trim();
			if (!custom) {
				throw new NodeOperationError(context.getNode(), 'Custom Entity Set cannot be empty', {
					itemIndex: index,
				});
			}
			return assertSafePathSegment(custom, 'Custom Entity Set');
		}
		const resolved = entitySet || fallback;
		return assertSafePathSegment(resolved, 'Entity Set');
	}

	function resolveEntitySetPath(
		context: IExecuteFunctions,
		index: number,
		fallback = defaultEntitySet,
	): string {
		return `/${domain}/${resolveEntitySet(context, index, fallback)}`;
	}

	function resolveNavigation(context: IExecuteFunctions, index: number): string {
		const nav = String(context.getNodeParameter('navigationProperty', index, '') || '').trim();
		if (!nav) {
			return '';
		}
		if (nav === 'custom') {
			const custom = String(
				context.getNodeParameter('customNavigationProperty', index, '') || '',
			).trim();
			if (!custom) {
				throw new NodeOperationError(
					context.getNode(),
					'Custom Navigation Property cannot be empty',
					{ itemIndex: index },
				);
			}
			return assertSafePathSegment(custom, 'Custom Navigation Property');
		}
		return assertSafePathSegment(nav, 'Navigation Property');
	}

	return {
		domain,
		defaultEntitySet,
		createEntitySetProperties,
		createNavigationProperties,
		resolveEntitySet,
		resolveEntitySetPath,
		resolveNavigation,
	};
}

export type DomainHelper = ReturnType<typeof createDomainHelper>;
