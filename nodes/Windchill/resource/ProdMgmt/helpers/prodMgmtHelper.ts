import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { createDomainHelper } from '../../../../help/utils/DomainHelper';
import { WindchillDomains } from '../../../../help/utils/WindchillConstants';

const helper = createDomainHelper({
	domain: WindchillDomains.ProdMgmt,
	defaultEntitySet: 'Parts',
	entitySets: [
		{ name: '零件 (Parts)', value: 'Parts' },
		{ name: '电气零件 (ElectricalParts)', value: 'ElectricalParts' },
		{ name: '供应商零件 (SupplierParts)', value: 'SupplierParts' },
		{ name: '制造商零件 (ManufacturerParts)', value: 'ManufacturerParts' },
		{ name: '厂商零件 (VendorParts)', value: 'VendorParts' },
		{ name: '零件内容 (PartContents)', value: 'PartContents' },
		{ name: 'AVL/AML 条目 (AXLEntries)', value: 'AXLEntries' },
		{ name: '寻源上下文 (SourcingContexts)', value: 'SourcingContexts' },
		{ name: '替换件 (ReplacementParts)', value: 'ReplacementParts' },
		{ name: '全局替代关联 (PartAlternateLinks)', value: 'PartAlternateLinks' },
		{ name: '局部代用关联 (PartSubstituteLinks)', value: 'PartSubstituteLinks' },
	],
	navigationProperties: [
		{ name: '无（获取实体本身）', value: '' },
		{ name: '子件关联 (Uses)', value: 'Uses' },
		{ name: '父件反查 (UsedBy)', value: 'UsedBy' },
		{ name: 'BOM 展开 (BOM)', value: 'BOM' },
		{ name: 'AVL/AML 条目 (AXLEntries)', value: 'AXLEntries' },
		{ name: '全局替代件 (Alternates)', value: 'Alternates' },
		{ name: '局部代用件 (Substitutes)', value: 'Substitutes' },
		{ name: '分配选项集 (AssignedOptionSet)', value: 'AssignedOptionSet' },
		{ name: '部件文档关联 (PartDocAssociations)', value: 'PartDocAssociations' },
		{ name: '附件 (Attachments)', value: 'Attachments' },
		{ name: '说明文档 (DescribedBy)', value: 'DescribedBy' },
		{ name: '参考文档 (ReferenceDocuments)', value: 'ReferenceDocuments' },
		{ name: '自定义导航属性 (Custom)', value: 'custom' },
	],
});

export const PROD_MGMT_ENTITY_SET_OPTIONS = helper.createEntitySetProperties()[0].options!;
export const PROD_MGMT_NAV_OPTIONS = helper.createNavigationProperties()[0].options!;

export function createProdMgmtEntitySetProperties(defaultValue = 'Parts'): INodeProperties[] {
	return helper.createEntitySetProperties(defaultValue);
}

export function createProdMgmtNavigationProperties(): INodeProperties[] {
	return helper.createNavigationProperties();
}

export function resolveProdMgmtEntitySet(context: IExecuteFunctions, index: number): string {
	return helper.resolveEntitySet(context, index);
}

export function resolveProdMgmtEntitySetPath(context: IExecuteFunctions, index: number): string {
	return helper.resolveEntitySetPath(context, index);
}

export function resolveProdMgmtNavigation(context: IExecuteFunctions, index: number): string {
	try {
		return helper.resolveNavigation(context, index);
	} catch (error) {
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw error;
	}
}
