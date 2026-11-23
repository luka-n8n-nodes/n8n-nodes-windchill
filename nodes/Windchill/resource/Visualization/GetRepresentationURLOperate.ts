import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';

const GetRepresentationURLOperate: ResourceOperations =
	WindchillOperationFactory.createFunctionOperate({
		name: '获取可视化表示 URL (Get Representation URL)',
		value: 'visualization:getRepresentationURL',
		description: '调用 PTC.Visualization.GetRepresentationURL 获取可视化表示访问 URL',
		order: 40,
		idParam: false,
		paginated: false,
		params: [
			{
				displayName: 'Call Mode',
				name: 'callMode',
				type: 'options',
				options: [
					{
						name: '绑定表示实体 (Representations({OID})/PTC.Visualization.GetRepresentationURL)',
						value: 'boundRepresentation',
					},
					{
						name: '域级函数 (/Visualization/PTC.Visualization.GetRepresentationURL)',
						value: 'unbound',
					},
					{
						name: '自定义函数路径 (Custom)',
						value: 'custom',
					},
				],
				default: 'boundRepresentation',
				description: '选择调用 GetRepresentationURL 函数的路径模式',
			},
			{
				displayName: 'Representation ID',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'OR:wt.representation.Representation:12345',
				displayOptions: {
					show: {
						callMode: ['boundRepresentation'],
					},
				},
				description: FieldDescriptions.oid,
				hint: FieldHints.oid,
			},
			{
				displayName: 'Function Parameters',
				name: 'functionParams',
				type: 'string',
				default: '',
				placeholder: "RepresentationID='OR:wt.representation.Representation:12345'",
				displayOptions: {
					show: {
						callMode: ['boundRepresentation', 'unbound'],
					},
				},
				description: '可选函数括号内参数（例如 key=value 逗号分隔）；留空则使用无参调用 ()',
			},
			{
				displayName: 'Custom Function Path',
				name: 'customFunctionPath',
				type: 'string',
				required: true,
				default: '',
				placeholder:
					"/Visualization/Representations('OR:wt.representation.Representation:12345')/PTC.Visualization.GetRepresentationURL()",
				displayOptions: {
					show: {
						callMode: ['custom'],
					},
				},
				description: '自定义 OData 函数路径（可省略 /Visualization/ 前缀）',
			},
		],
		path(this: IExecuteFunctions, index: number): string {
			const callMode = String(this.getNodeParameter('callMode', index, 'boundRepresentation'));

			if (callMode === 'custom') {
				const customPath = String(this.getNodeParameter('customFunctionPath', index, '')).trim();
				if (!customPath) {
					throw new NodeOperationError(this.getNode(), 'Custom Function Path cannot be empty', {
						itemIndex: index,
					});
				}
				const clean = customPath.replace(/^\/+/, '');
				return clean.startsWith('Visualization/') ? `/${clean}` : `/Visualization/${clean}`;
			}

			const functionParams = String(this.getNodeParameter('functionParams', index, '')).trim();
			const funcSegment = functionParams
				? `PTC.Visualization.GetRepresentationURL(${functionParams})`
				: 'PTC.Visualization.GetRepresentationURL()';

			if (callMode === 'unbound') {
				return `/Visualization/${funcSegment}`;
			}

			const id = String(this.getNodeParameter('id', index, '')).trim();
			if (!id) {
				throw new NodeOperationError(this.getNode(), 'Representation ID cannot be empty', {
					itemIndex: index,
				});
			}
			const entityUrl = ODataUtils.buildEntityUrl('/Visualization/Representations', id);
			return `${entityUrl}/${funcSegment}`;
		},
	});

export default GetRepresentationURLOperate;
