import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createDomainHelper } from '../../../../help/utils/DomainHelper';
import { WindchillDomains } from '../../../../help/utils/WindchillConstants';

const helper = createDomainHelper({
	domain: WindchillDomains.ClfStructure,
	defaultEntitySet: 'ClassificationNodes',
	entitySets: [
		{ name: '分类属性 (ClassificationAttributes)', value: 'ClassificationAttributes' },
		{ name: '分类属性值 (ClassificationAttributeValues)', value: 'ClassificationAttributeValues' },
		{ name: '分类节点 (ClassificationNodes)', value: 'ClassificationNodes' },
	],
});

export const classificationEntitySetOptions = helper.createEntitySetProperties()[0].options!;

export function createEntitySetProperties(defaultValue = 'ClassificationNodes'): INodeProperties[] {
	return helper.createEntitySetProperties(defaultValue);
}

export function resolveClassificationEntitySetPath(
	context: IExecuteFunctions,
	index: number,
): string {
	return helper.resolveEntitySetPath(context, index);
}
