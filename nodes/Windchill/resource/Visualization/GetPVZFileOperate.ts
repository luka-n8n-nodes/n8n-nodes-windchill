import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';
import { FieldDescriptions, FieldHints } from '../../../help/utils/fieldHints';
import ODataUtils from '../../../help/utils/ODataUtils';

const GetPVZFileOperate: ResourceOperations = WindchillOperationFactory.createBinaryDownloadOperate(
	{
		name: '下载 PVZ 文件 (Get PVZ File)',
		value: 'visualization:getPVZFile',
		description: '下载 Visualization PVZ 二进制文件流（支持 GetPVZFile 或 $value）',
		order: 50,
		idParam: false,
		defaultFileName: 'visualization.pvz',
		defaultMimeType: 'application/octet-stream',
		extraProperties: [
			{
				displayName: 'Download Mode',
				name: 'downloadMode',
				type: 'options',
				options: [
					{
						name: '表示实体 GetPVZFile (Representations({OID})/PTC.Visualization.GetPVZFile())',
						value: 'representationGetPVZFile',
					},
					{
						name: 'PVZ 文件流 (PVZFiles({OID})/$value)',
						value: 'pvzFileValue',
					},
					{
						name: '表示内容流 (Representations({OID})/Content/$value)',
						value: 'representationContent',
					},
					{
						name: '自定义路径 (Custom)',
						value: 'custom',
					},
				],
				default: 'representationGetPVZFile',
				description: '选择 PVZ 文件二进制下载端点格式',
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'OR:wt.representation.Representation:12345',
				displayOptions: {
					show: {
						downloadMode: ['representationGetPVZFile', 'pvzFileValue', 'representationContent'],
					},
				},
				description: FieldDescriptions.oid,
				hint: FieldHints.oid,
			},
			{
				displayName: 'Custom Path',
				name: 'customPath',
				type: 'string',
				required: true,
				default: '',
				placeholder:
					"/Visualization/Representations('OR:wt.representation.Representation:12345')/PTC.Visualization.GetPVZFile()",
				displayOptions: {
					show: {
						downloadMode: ['custom'],
					},
				},
				description: '自定义二进制下载路径（可省略 /Visualization/ 前缀）',
			},
		],
		path(this: IExecuteFunctions, index: number): string {
			const downloadMode = String(
				this.getNodeParameter('downloadMode', index, 'representationGetPVZFile'),
			);

			if (downloadMode === 'custom') {
				const customPath = String(this.getNodeParameter('customPath', index, '')).trim();
				if (!customPath) {
					throw new NodeOperationError(this.getNode(), 'Custom Path cannot be empty', {
						itemIndex: index,
					});
				}
				const clean = customPath.replace(/^\/+/, '');
				return clean.startsWith('Visualization/') ? `/${clean}` : `/Visualization/${clean}`;
			}

			const id = String(this.getNodeParameter('id', index, '')).trim();
			if (!id) {
				throw new NodeOperationError(this.getNode(), 'ID cannot be empty', {
					itemIndex: index,
				});
			}

			if (downloadMode === 'pvzFileValue') {
				return `${ODataUtils.buildEntityUrl('/Visualization/PVZFiles', id)}/$value`;
			}
			if (downloadMode === 'representationContent') {
				return `${ODataUtils.buildEntityUrl('/Visualization/Representations', id)}/Content/$value`;
			}
			return `${ODataUtils.buildEntityUrl('/Visualization/Representations', id)}/PTC.Visualization.GetPVZFile()`;
		},
	},
);

export default GetPVZFileOperate;
