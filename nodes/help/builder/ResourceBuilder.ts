import { INodePropertyOptions, INodeProperties, NodePropertyTypes } from 'n8n-workflow';
import {
	IResource,
	ResourceOperations,
	OperationCallFunction,
	OperationExecuteAllFunction,
} from '../type/IResource';

/**
 * 资源构建器
 * 用于构建 n8n 节点的 resource/operation 结构
 */
class ResourceBuilder {
	/** 已注册的资源列表 */
	private resources: IResource[] = [];

	/**
	 * 添加资源
	 */
	addResource(resource: INodePropertyOptions): void {
		this.resources.push({
			...resource,
			operations: [],
		});
	}

	/**
	 * 添加操作到指定资源
	 */
	addOperate(resourceName: string, operate: ResourceOperations): void {
		const resource = this.resources.find((r) => r.value === resourceName);
		if (resource) {
			resource.operations.push(operate);
		}
	}

	/**
	 * 构建节点属性列表
	 */
	build(): INodeProperties[] {
		const properties: INodeProperties[] = [];

		properties.push(this.buildResourceProperty());

		for (const resource of this.resources) {
			if (resource.operations.length === 0) continue;

			properties.push(this.buildOperationProperty(resource));
			properties.push(...this.buildOperationOptions(resource));
		}

		return properties;
	}

	/**
	 * 构建 Resource 属性（仅暴露 UI 需要的字段）
	 */
	private buildResourceProperty(): INodeProperties {
		const resourceOptions: INodePropertyOptions[] = this.resources.map((item) => ({
			name: item.name,
			value: item.value,
			description: item.description || '',
		}));

		return {
			displayName: 'Resource',
			name: 'resource',
			type: 'options' as NodePropertyTypes,
			noDataExpression: true,
			options: resourceOptions,
			default: resourceOptions[0]?.value ?? '',
		};
	}

	/**
	 * 构建 Operation 属性（仅暴露 UI 需要的字段，不泄漏 call/executeAll）
	 */
	private buildOperationProperty(resource: IResource): INodeProperties {
		const operationOptions: INodePropertyOptions[] = resource.operations.map((item) => ({
			name: item.name,
			value: item.value,
			description: item.description || '',
			action: item.action || item.name || '',
		}));

		return {
			displayName: 'Operation',
			name: 'operation',
			type: 'options' as NodePropertyTypes,
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: [resource.value],
				},
			},
			options: operationOptions,
			default: operationOptions[0]?.value ?? '',
		};
	}

	/**
	 * 构建操作的参数选项
	 */
	private buildOperationOptions(resource: IResource): INodeProperties[] {
		const options: INodeProperties[] = [];

		for (const operation of resource.operations) {
			for (const option of operation.options) {
				const mergedDisplayOptions = {
					...option.displayOptions,
					show: {
						...option.displayOptions?.show,
						resource: [resource.value],
						operation: [operation.value],
					},
				};

				options.push({
					...option,
					displayOptions: mergedDisplayOptions,
				});
			}
		}

		return options;
	}

	/**
	 * 获取操作的执行函数
	 */
	getCall(resourceName: string, operateName: string): OperationCallFunction | undefined {
		return this.getOperation(resourceName, operateName)?.call;
	}

	getExecuteAll(
		resourceName: string,
		operateName: string,
	): OperationExecuteAllFunction | undefined {
		return this.getOperation(resourceName, operateName)?.executeAll;
	}

	getOperation(resourceName: string, operateName: string): ResourceOperations | undefined {
		const resource = this.resources.find((item) => item.value === resourceName);
		if (!resource) {
			return undefined;
		}

		return resource.operations.find((item) => item.value === operateName);
	}
}

export default ResourceBuilder;
