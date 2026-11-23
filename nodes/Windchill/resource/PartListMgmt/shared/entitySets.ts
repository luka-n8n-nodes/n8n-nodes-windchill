import { IDisplayOptions, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createDomainHelper } from '../../../../help/utils/DomainHelper';
import { WindchillDomains } from '../../../../help/utils/WindchillConstants';

const helper = createDomainHelper({
	domain: WindchillDomains.PartListMgmt,
	defaultEntitySet: 'PartLists',
	entitySets: [
		{ name: '零件清单 (PartLists)', value: 'PartLists' },
		{ name: '零件清单内容 (PartListContents)', value: 'PartListContents' },
		{ name: '零件清单项 (PartListItems)', value: 'PartListItems' },
	],
});

export const partsListEntitySetOptions = helper.createEntitySetProperties()[0].options!;

export function createEntitySetProperties(
	defaultValue = 'PartLists',
	extraShowCondition?: IDisplayOptions['show'],
): INodeProperties[] {
	return helper.createEntitySetProperties(
		defaultValue,
		extraShowCondition ? { show: extraShowCondition } : undefined,
	);
}

export function resolvePartsListEntitySetPath(context: IExecuteFunctions, index: number): string {
	return helper.resolveEntitySetPath(context, index);
}
