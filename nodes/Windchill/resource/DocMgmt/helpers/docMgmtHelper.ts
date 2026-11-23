import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createDomainHelper } from '../../../../help/utils/DomainHelper';
import { WindchillDomains } from '../../../../help/utils/WindchillConstants';

const helper = createDomainHelper({
	domain: WindchillDomains.DocMgmt,
	defaultEntitySet: 'Documents',
	entitySets: [
		{ name: '文档 (Documents)', value: 'Documents' },
		{ name: '文档内容 (DocumentContents)', value: 'DocumentContents' },
		{ name: '附件 (Attachments)', value: 'Attachments' },
		{ name: '主内容 (PrimaryContents)', value: 'PrimaryContents' },
	],
	navigationProperties: [
		{ name: '无（获取实体本身）', value: '' },
		{ name: '主内容 (PrimaryContent)', value: 'PrimaryContent' },
		{ name: '附件 (Attachments)', value: 'Attachments' },
		{ name: '版本历史 (Versions)', value: 'Versions' },
		{ name: '主对象 (Master)', value: 'Master' },
		{ name: '自定义导航属性 (Custom)', value: 'custom' },
	],
});

export function createDocMgmtEntitySetProperties(defaultValue = 'Documents'): INodeProperties[] {
	return helper.createEntitySetProperties(defaultValue);
}

export function createDocMgmtNavigationProperties(): INodeProperties[] {
	return helper.createNavigationProperties();
}

export function resolveDocMgmtEntitySetPath(context: IExecuteFunctions, index: number): string {
	return helper.resolveEntitySetPath(context, index);
}

export function resolveDocMgmtNavigation(context: IExecuteFunctions, index: number): string {
	return helper.resolveNavigation(context, index);
}
