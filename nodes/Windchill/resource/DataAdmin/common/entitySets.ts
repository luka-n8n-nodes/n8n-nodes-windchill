import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createDomainHelper } from '../../../../help/utils/DomainHelper';
import { WindchillDomains } from '../../../../help/utils/WindchillConstants';

const helper = createDomainHelper({
	domain: WindchillDomains.DataAdmin,
	defaultEntitySet: 'Folders',
	entitySets: [
		{ name: 'Folders（文件夹）', value: 'Folders' },
		{ name: 'Cabinets（存储柜）', value: 'Cabinets' },
		{ name: 'Containers（容器）', value: 'Containers' },
		{ name: 'Products（产品）', value: 'Products' },
		{ name: 'Libraries（存储库）', value: 'Libraries' },
		{ name: 'Projects（项目）', value: 'Projects' },
		{ name: 'LifeCycleStates（生命周期状态）', value: 'LifeCycleStates' },
		{ name: 'LifeCycleTemplates（生命周期模板）', value: 'LifeCycleTemplates' },
		{ name: 'FolderContents（文件夹内容）', value: 'FolderContents' },
	],
});

export const dataAdminEntitySetOptions = helper.createEntitySetProperties()[0].options!;

export function buildDataAdminEntitySetProperties(defaultValue = 'Folders'): INodeProperties[] {
	return helper.createEntitySetProperties(defaultValue);
}

export function resolveDataAdminEntitySet(
	context: IExecuteFunctions,
	index: number,
	defaultValue = 'Folders',
): string {
	return helper.resolveEntitySet(context, index, defaultValue);
}
