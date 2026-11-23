import ResourceBuilder from './ResourceBuilder';
import { ResourceOperations, ResourceOptions } from '../type/IResource';

import CADDocumentMgmtResource from '../../Windchill/resource/CADDocumentMgmtResource';
import CADDocumentMgmt_CreateOperate from '../../Windchill/resource/CADDocumentMgmt/CreateOperate';
import CADDocumentMgmt_DeleteOperate from '../../Windchill/resource/CADDocumentMgmt/DeleteOperate';
import CADDocumentMgmt_GetOperate from '../../Windchill/resource/CADDocumentMgmt/GetOperate';
import CADDocumentMgmt_ListOperate from '../../Windchill/resource/CADDocumentMgmt/ListOperate';
import CADDocumentMgmt_UpdateOperate from '../../Windchill/resource/CADDocumentMgmt/UpdateOperate';
import ChangeMgmtResource from '../../Windchill/resource/ChangeMgmtResource';
import ChangeMgmt_CreateChangeNoticeOperate from '../../Windchill/resource/ChangeMgmt/CreateChangeNoticeOperate';
import ChangeMgmt_CreateOperate from '../../Windchill/resource/ChangeMgmt/CreateOperate';
import ChangeMgmt_DeleteOperate from '../../Windchill/resource/ChangeMgmt/DeleteOperate';
import ChangeMgmt_GetOperate from '../../Windchill/resource/ChangeMgmt/GetOperate';
import ChangeMgmt_ListOperate from '../../Windchill/resource/ChangeMgmt/ListOperate';
import ChangeMgmt_SetLifeCycleStateOperate from '../../Windchill/resource/ChangeMgmt/SetLifeCycleStateOperate';
import ChangeMgmt_UpdateOperate from '../../Windchill/resource/ChangeMgmt/UpdateOperate';
import ClfStructureResource from '../../Windchill/resource/ClfStructureResource';
import ClfStructure_CreateOperate from '../../Windchill/resource/ClfStructure/CreateOperate';
import ClfStructure_DeleteOperate from '../../Windchill/resource/ClfStructure/DeleteOperate';
import ClfStructure_GetChildNodesOperate from '../../Windchill/resource/ClfStructure/GetChildNodesOperate';
import ClfStructure_GetClassificationPathOperate from '../../Windchill/resource/ClfStructure/GetClassificationPathOperate';
import ClfStructure_GetOperate from '../../Windchill/resource/ClfStructure/GetOperate';
import ClfStructure_GetParentNodeOperate from '../../Windchill/resource/ClfStructure/GetParentNodeOperate';
import ClfStructure_ListOperate from '../../Windchill/resource/ClfStructure/ListOperate';
import ClfStructure_UpdateOperate from '../../Windchill/resource/ClfStructure/UpdateOperate';
import DataAdminResource from '../../Windchill/resource/DataAdminResource';
import DataAdmin_CreateOperate from '../../Windchill/resource/DataAdmin/CreateOperate';
import DataAdmin_DeleteOperate from '../../Windchill/resource/DataAdmin/DeleteOperate';
import DataAdmin_GetOperate from '../../Windchill/resource/DataAdmin/GetOperate';
import DataAdmin_ListOperate from '../../Windchill/resource/DataAdmin/ListOperate';
import DataAdmin_UpdateOperate from '../../Windchill/resource/DataAdmin/UpdateOperate';
import DocMgmtResource from '../../Windchill/resource/DocMgmtResource';
import DocMgmt_CreateOperate from '../../Windchill/resource/DocMgmt/CreateOperate';
import DocMgmt_DeleteOperate from '../../Windchill/resource/DocMgmt/DeleteOperate';
import DocMgmt_DownloadContentOperate from '../../Windchill/resource/DocMgmt/DownloadContentOperate';
import DocMgmt_GetOperate from '../../Windchill/resource/DocMgmt/GetOperate';
import DocMgmt_LifecycleActionOperate from '../../Windchill/resource/DocMgmt/LifecycleActionOperate';
import DocMgmt_ListOperate from '../../Windchill/resource/DocMgmt/ListOperate';
import DocMgmt_UpdateOperate from '../../Windchill/resource/DocMgmt/UpdateOperate';
import DynamicDocMgmtResource from '../../Windchill/resource/DynamicDocMgmtResource';
import DynamicDocMgmt_CreateOperate from '../../Windchill/resource/DynamicDocMgmt/CreateOperate';
import DynamicDocMgmt_DeleteOperate from '../../Windchill/resource/DynamicDocMgmt/DeleteOperate';
import DynamicDocMgmt_ExecuteActionOperate from '../../Windchill/resource/DynamicDocMgmt/ExecuteActionOperate';
import DynamicDocMgmt_ExecuteFunctionOperate from '../../Windchill/resource/DynamicDocMgmt/ExecuteFunctionOperate';
import DynamicDocMgmt_GetOperate from '../../Windchill/resource/DynamicDocMgmt/GetOperate';
import DynamicDocMgmt_ListOperate from '../../Windchill/resource/DynamicDocMgmt/ListOperate';
import DynamicDocMgmt_UpdateOperate from '../../Windchill/resource/DynamicDocMgmt/UpdateOperate';
import EventMgmtResource from '../../Windchill/resource/EventMgmtResource';
import EventMgmt_DeleteOperate from '../../Windchill/resource/EventMgmt/DeleteOperate';
import EventMgmt_GetOperate from '../../Windchill/resource/EventMgmt/GetOperate';
import EventMgmt_ListOperate from '../../Windchill/resource/EventMgmt/ListOperate';
import EventMgmt_SubscribeToEventOperate from '../../Windchill/resource/EventMgmt/SubscribeToEventOperate';
import EventMgmt_SubscribeToTypeEventOperate from '../../Windchill/resource/EventMgmt/SubscribeToTypeEventOperate';
import EventMgmt_UnsubscribeOperate from '../../Windchill/resource/EventMgmt/UnsubscribeOperate';
import NavCriteriaResource from '../../Windchill/resource/NavCriteriaResource';
import NavCriteria_CreateOperate from '../../Windchill/resource/NavCriteria/CreateOperate';
import NavCriteria_DeleteOperate from '../../Windchill/resource/NavCriteria/DeleteOperate';
import NavCriteria_GetOperate from '../../Windchill/resource/NavCriteria/GetOperate';
import NavCriteria_ListOperate from '../../Windchill/resource/NavCriteria/ListOperate';
import NavCriteria_UpdateOperate from '../../Windchill/resource/NavCriteria/UpdateOperate';
import ODataResource from '../../Windchill/resource/ODataResource';
import OData_CustomRequestOperate from '../../Windchill/resource/OData/CustomRequestOperate';
import OData_ExecuteBatchOperate from '../../Windchill/resource/OData/ExecuteBatchOperate';
import OData_GetDomainEntitySetsOperate from '../../Windchill/resource/OData/GetDomainEntitySetsOperate';
import OData_GetMetadataOperate from '../../Windchill/resource/OData/GetMetadataOperate';
import OData_GetServiceRootOperate from '../../Windchill/resource/OData/GetServiceRootOperate';
import PTCResource from '../../Windchill/resource/PTCResource';
import PTC_GetEnumerationValuesOperate from '../../Windchill/resource/PTC/GetEnumerationValuesOperate';
import PTC_GetLocalizedStringOperate from '../../Windchill/resource/PTC/GetLocalizedStringOperate';
import PTC_GetNonceTokenOperate from '../../Windchill/resource/PTC/GetNonceTokenOperate';
import PTC_ListOperate from '../../Windchill/resource/PTC/ListOperate';
import PartListMgmtResource from '../../Windchill/resource/PartListMgmtResource';
import PartListMgmt_CreateOperate from '../../Windchill/resource/PartListMgmt/CreateOperate';
import PartListMgmt_DeleteOperate from '../../Windchill/resource/PartListMgmt/DeleteOperate';
import PartListMgmt_ExecuteActionOperate from '../../Windchill/resource/PartListMgmt/ExecuteActionOperate';
import PartListMgmt_ExecuteFunctionOperate from '../../Windchill/resource/PartListMgmt/ExecuteFunctionOperate';
import PartListMgmt_GetOperate from '../../Windchill/resource/PartListMgmt/GetOperate';
import PartListMgmt_ListOperate from '../../Windchill/resource/PartListMgmt/ListOperate';
import PartListMgmt_UpdateOperate from '../../Windchill/resource/PartListMgmt/UpdateOperate';
import PrincipalMgmtResource from '../../Windchill/resource/PrincipalMgmtResource';
import PrincipalMgmt_CreateOperate from '../../Windchill/resource/PrincipalMgmt/CreateOperate';
import PrincipalMgmt_DeleteOperate from '../../Windchill/resource/PrincipalMgmt/DeleteOperate';
import PrincipalMgmt_GetOperate from '../../Windchill/resource/PrincipalMgmt/GetOperate';
import PrincipalMgmt_ListOperate from '../../Windchill/resource/PrincipalMgmt/ListOperate';
import PrincipalMgmt_UpdateOperate from '../../Windchill/resource/PrincipalMgmt/UpdateOperate';
import ProdMgmtResource from '../../Windchill/resource/ProdMgmtResource';
import ProdMgmt_CreateOperate from '../../Windchill/resource/ProdMgmt/CreateOperate';
import ProdMgmt_DeleteOperate from '../../Windchill/resource/ProdMgmt/DeleteOperate';
import ProdMgmt_GetDynamicStructurePVZOperate from '../../Windchill/resource/ProdMgmt/GetDynamicStructurePVZOperate';
import ProdMgmt_GetDynamicStructureRepresentationOperate from '../../Windchill/resource/ProdMgmt/GetDynamicStructureRepresentationOperate';
import ProdMgmt_GetLatestVersionOperate from '../../Windchill/resource/ProdMgmt/GetLatestVersionOperate';
import ProdMgmt_GetOperate from '../../Windchill/resource/ProdMgmt/GetOperate';
import ProdMgmt_GetPartStructureOperate from '../../Windchill/resource/ProdMgmt/GetPartStructureOperate';
import ProdMgmt_GetPartsListOperate from '../../Windchill/resource/ProdMgmt/GetPartsListOperate';
import ProdMgmt_LifecycleActionOperate from '../../Windchill/resource/ProdMgmt/LifecycleActionOperate';
import ProdMgmt_ListOperate from '../../Windchill/resource/ProdMgmt/ListOperate';
import ProdMgmt_UpdateOperate from '../../Windchill/resource/ProdMgmt/UpdateOperate';
import ProdPlatformMgmtResource from '../../Windchill/resource/ProdPlatformMgmtResource';
import ProdPlatformMgmt_GetOperate from '../../Windchill/resource/ProdPlatformMgmt/GetOperate';
import ProdPlatformMgmt_ListOperate from '../../Windchill/resource/ProdPlatformMgmt/ListOperate';
import VisualizationResource from '../../Windchill/resource/VisualizationResource';
import Visualization_DeleteOperate from '../../Windchill/resource/Visualization/DeleteOperate';
import Visualization_GetOperate from '../../Windchill/resource/Visualization/GetOperate';
import Visualization_GetPVZFileOperate from '../../Windchill/resource/Visualization/GetPVZFileOperate';
import Visualization_GetRepresentationURLOperate from '../../Windchill/resource/Visualization/GetRepresentationURLOperate';
import Visualization_ListOperate from '../../Windchill/resource/Visualization/ListOperate';
import WorkflowResource from '../../Windchill/resource/WorkflowResource';
import Workflow_CompleteWorkItemOperate from '../../Windchill/resource/Workflow/CompleteWorkItemOperate';
import Workflow_CreateOperate from '../../Windchill/resource/Workflow/CreateOperate';
import Workflow_GetOperate from '../../Windchill/resource/Workflow/GetOperate';
import Workflow_GetReassignCandidatesOperate from '../../Windchill/resource/Workflow/GetReassignCandidatesOperate';
import Workflow_GetRoutingOptionsOperate from '../../Windchill/resource/Workflow/GetRoutingOptionsOperate';
import Workflow_GetSubjectsOperate from '../../Windchill/resource/Workflow/GetSubjectsOperate';
import Workflow_GetWorkItemsOperate from '../../Windchill/resource/Workflow/GetWorkItemsOperate';
import Workflow_ListOperate from '../../Windchill/resource/Workflow/ListOperate';
import Workflow_ReassignWorkItemOperate from '../../Windchill/resource/Workflow/ReassignWorkItemOperate';
import Workflow_SaveWorkItemOperate from '../../Windchill/resource/Workflow/SaveWorkItemOperate';
import Workflow_UpdateOperate from '../../Windchill/resource/Workflow/UpdateOperate';

interface IRegisteredResource {
	resource: ResourceOptions;
	operations: ResourceOperations[];
}

const registry: IRegisteredResource[] = [
	{
		resource: CADDocumentMgmtResource,
		operations: [
			CADDocumentMgmt_CreateOperate,
			CADDocumentMgmt_DeleteOperate,
			CADDocumentMgmt_GetOperate,
			CADDocumentMgmt_ListOperate,
			CADDocumentMgmt_UpdateOperate,
		],
	},
	{
		resource: ChangeMgmtResource,
		operations: [
			ChangeMgmt_CreateChangeNoticeOperate,
			ChangeMgmt_CreateOperate,
			ChangeMgmt_DeleteOperate,
			ChangeMgmt_GetOperate,
			ChangeMgmt_ListOperate,
			ChangeMgmt_SetLifeCycleStateOperate,
			ChangeMgmt_UpdateOperate,
		],
	},
	{
		resource: ClfStructureResource,
		operations: [
			ClfStructure_CreateOperate,
			ClfStructure_DeleteOperate,
			ClfStructure_GetChildNodesOperate,
			ClfStructure_GetClassificationPathOperate,
			ClfStructure_GetOperate,
			ClfStructure_GetParentNodeOperate,
			ClfStructure_ListOperate,
			ClfStructure_UpdateOperate,
		],
	},
	{
		resource: DataAdminResource,
		operations: [
			DataAdmin_CreateOperate,
			DataAdmin_DeleteOperate,
			DataAdmin_GetOperate,
			DataAdmin_ListOperate,
			DataAdmin_UpdateOperate,
		],
	},
	{
		resource: DocMgmtResource,
		operations: [
			DocMgmt_CreateOperate,
			DocMgmt_DeleteOperate,
			DocMgmt_DownloadContentOperate,
			DocMgmt_GetOperate,
			DocMgmt_LifecycleActionOperate,
			DocMgmt_ListOperate,
			DocMgmt_UpdateOperate,
		],
	},
	{
		resource: DynamicDocMgmtResource,
		operations: [
			DynamicDocMgmt_CreateOperate,
			DynamicDocMgmt_DeleteOperate,
			DynamicDocMgmt_ExecuteActionOperate,
			DynamicDocMgmt_ExecuteFunctionOperate,
			DynamicDocMgmt_GetOperate,
			DynamicDocMgmt_ListOperate,
			DynamicDocMgmt_UpdateOperate,
		],
	},
	{
		resource: EventMgmtResource,
		operations: [
			EventMgmt_DeleteOperate,
			EventMgmt_GetOperate,
			EventMgmt_ListOperate,
			EventMgmt_SubscribeToEventOperate,
			EventMgmt_SubscribeToTypeEventOperate,
			EventMgmt_UnsubscribeOperate,
		],
	},
	{
		resource: NavCriteriaResource,
		operations: [
			NavCriteria_CreateOperate,
			NavCriteria_DeleteOperate,
			NavCriteria_GetOperate,
			NavCriteria_ListOperate,
			NavCriteria_UpdateOperate,
		],
	},
	{
		resource: ODataResource,
		operations: [
			OData_CustomRequestOperate,
			OData_ExecuteBatchOperate,
			OData_GetDomainEntitySetsOperate,
			OData_GetMetadataOperate,
			OData_GetServiceRootOperate,
		],
	},
	{
		resource: PTCResource,
		operations: [
			PTC_GetEnumerationValuesOperate,
			PTC_GetLocalizedStringOperate,
			PTC_GetNonceTokenOperate,
			PTC_ListOperate,
		],
	},
	{
		resource: PartListMgmtResource,
		operations: [
			PartListMgmt_CreateOperate,
			PartListMgmt_DeleteOperate,
			PartListMgmt_ExecuteActionOperate,
			PartListMgmt_ExecuteFunctionOperate,
			PartListMgmt_GetOperate,
			PartListMgmt_ListOperate,
			PartListMgmt_UpdateOperate,
		],
	},
	{
		resource: PrincipalMgmtResource,
		operations: [
			PrincipalMgmt_CreateOperate,
			PrincipalMgmt_DeleteOperate,
			PrincipalMgmt_GetOperate,
			PrincipalMgmt_ListOperate,
			PrincipalMgmt_UpdateOperate,
		],
	},
	{
		resource: ProdMgmtResource,
		operations: [
			ProdMgmt_CreateOperate,
			ProdMgmt_DeleteOperate,
			ProdMgmt_GetDynamicStructurePVZOperate,
			ProdMgmt_GetDynamicStructureRepresentationOperate,
			ProdMgmt_GetLatestVersionOperate,
			ProdMgmt_GetOperate,
			ProdMgmt_GetPartStructureOperate,
			ProdMgmt_GetPartsListOperate,
			ProdMgmt_LifecycleActionOperate,
			ProdMgmt_ListOperate,
			ProdMgmt_UpdateOperate,
		],
	},
	{
		resource: ProdPlatformMgmtResource,
		operations: [
			ProdPlatformMgmt_GetOperate,
			ProdPlatformMgmt_ListOperate,
		],
	},
	{
		resource: VisualizationResource,
		operations: [
			Visualization_DeleteOperate,
			Visualization_GetOperate,
			Visualization_GetPVZFileOperate,
			Visualization_GetRepresentationURLOperate,
			Visualization_ListOperate,
		],
	},
	{
		resource: WorkflowResource,
		operations: [
			Workflow_CompleteWorkItemOperate,
			Workflow_CreateOperate,
			Workflow_GetOperate,
			Workflow_GetReassignCandidatesOperate,
			Workflow_GetRoutingOptionsOperate,
			Workflow_GetSubjectsOperate,
			Workflow_GetWorkItemsOperate,
			Workflow_ListOperate,
			Workflow_ReassignWorkItemOperate,
			Workflow_SaveWorkItemOperate,
			Workflow_UpdateOperate,
		],
	},
];

export function buildFromRegistry(): ResourceBuilder {
	const resourceBuilder = new ResourceBuilder();
	const sorted = [...registry].sort(
		(a, b) => (a.resource.order ?? 100) - (b.resource.order ?? 100),
	);
	for (const entry of sorted) {
		resourceBuilder.addResource(entry.resource);
		const operates = [...entry.operations].sort(
			(a, b) => (a.order ?? 100) - (b.order ?? 100),
		);
		for (const operate of operates) {
			resourceBuilder.addOperate(entry.resource.value as string, operate);
		}
	}
	return resourceBuilder;
}

export default registry;
