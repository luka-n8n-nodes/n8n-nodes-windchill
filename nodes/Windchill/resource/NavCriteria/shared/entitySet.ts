import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createDomainHelper } from '../../../../help/utils/DomainHelper';
import { WindchillDomains } from '../../../../help/utils/WindchillConstants';

const helper = createDomainHelper({
	domain: WindchillDomains.NavCriteria,
	defaultEntitySet: 'NavigationCriterias',
	entitySets: [
		{ name: 'CriteriaSpecs（条件规范）', value: 'CriteriaSpecs' },
		{ name: 'NavigationCriterias（导航条件）', value: 'NavigationCriterias' },
	],
});

export function buildNavCriteriaEntitySetProperties(
	defaultEntitySet = 'NavigationCriterias',
): INodeProperties[] {
	return helper.createEntitySetProperties(defaultEntitySet);
}

export function resolveNavCriteriaEntitySetPath(
	context: IExecuteFunctions,
	index: number,
	defaultEntitySet = 'NavigationCriterias',
): string {
	return helper.resolveEntitySetPath(context, index, defaultEntitySet);
}
