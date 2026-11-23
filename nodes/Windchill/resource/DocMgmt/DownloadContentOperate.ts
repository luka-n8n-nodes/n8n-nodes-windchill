import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import WindchillOperationFactory from '../../../help/builder/WindchillOperationFactory';
import { ResourceOperations } from '../../../help/type/IResource';

const DownloadContentOperate: ResourceOperations =
	WindchillOperationFactory.createBinaryDownloadOperate({
		name: '下载文档内容 (Download Content)',
		value: 'docMgmt:downloadContent',
		description:
			"下载文档主内容或附件二进制文件（支持 Documents('{OID}')/PrimaryContent/$value、Attachments('{OID}')/Content/$value 等路径模式）",
		order: 60,
		idParam: {
			displayName: 'Entity ID (OID)',
			placeholder: 'OR:wt.doc.WTDocument:12345',
			description: '文档或附件实体的 OID',
		},
		extraProperties: [
			{
				displayName: 'Content Path Mode',
				name: 'contentPathMode',
				type: 'options',
				required: true,
				options: [
					{
						name: "Attachments('{OID}')/Content/$value - 附件内容流",
						value: 'attachmentContent',
					},
					{
						name: 'Custom - 自定义下载路径模板',
						value: 'custom',
					},
					{
						name: "DocumentContents('{OID}')/$value - 文档内容值",
						value: 'documentContentValue',
					},
					{
						name: "Documents('{OID}')/PrimaryContent/$value - 文档主内容流",
						value: 'documentPrimaryContent',
					},
					{
						name: "PrimaryContents('{OID}')/Content/$value - 主内容实体流",
						value: 'primaryContentStream',
					},
				],
				default: 'documentPrimaryContent',
				description: '选择二进制内容下载的 OData 路径模式',
			},
			{
				displayName: 'Custom Path Template',
				name: 'customPathTemplate',
				type: 'string',
				required: true,
				default: "Documents('{ID}')/PrimaryContent/$value",
				placeholder: "Documents('{ID}')/PrimaryContent/$value",
				displayOptions: {
					show: {
						contentPathMode: ['custom'],
					},
				},
				description: '自定义 DocMgmt 域内相对路径模板，使用 {ID} 作为编码后的 OID 占位符',
			},
		],
		path(this: IExecuteFunctions, index: number): string {
			const id = String(this.getNodeParameter('id', index, '') || '').trim();
			if (!id) {
				throw new NodeOperationError(this.getNode(), 'Entity ID (OID) 不能为空', {
					itemIndex: index,
				});
			}

			const mode = String(
				this.getNodeParameter('contentPathMode', index, 'documentPrimaryContent') || '',
			).trim();

			switch (mode) {
				case 'documentPrimaryContent':
					return "/DocMgmt/Documents('{id}')/PrimaryContent/$value";
				case 'attachmentContent':
					return "/DocMgmt/Attachments('{id}')/Content/$value";
				case 'primaryContentStream':
					return "/DocMgmt/PrimaryContents('{id}')/Content/$value";
				case 'documentContentValue':
					return "/DocMgmt/DocumentContents('{id}')/$value";
				case 'custom': {
					let template = String(this.getNodeParameter('customPathTemplate', index, '') || '')
						.trim()
						.replace(/^\/+/, '');
					if (!template) {
						throw new NodeOperationError(this.getNode(), 'Custom Path Template 不能为空', {
							itemIndex: index,
						});
					}
					if (!template.startsWith('DocMgmt/')) {
						template = `DocMgmt/${template}`;
					}
					return `/${template.replace(/\{id\}/gi, '{id}')}`;
				}
				default:
					return "/DocMgmt/Documents('{id}')/PrimaryContent/$value";
			}
		},
	});

export default DownloadContentOperate;
