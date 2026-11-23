import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

/**
 * 节点工具类
 */
class NodeUtils {
	/**
	 * 获取节点参数并解析为 JSON
	 */
	static getNodeJsonData<T = unknown>(
		context: IExecuteFunctions,
		propertyName: string,
		index: number,
		failValue?: T,
	): T {
		const text = context.getNodeParameter(propertyName, index, failValue);

		if (text === undefined || text === null || text === '') {
			return failValue as T;
		}

		if (typeof text === 'object') {
			return text as T;
		}

		if (typeof text === 'string') {
			try {
				return JSON.parse(text) as T;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				throw new NodeOperationError(
					context.getNode(),
					`Failed to parse JSON for parameter [${propertyName}]: ${errorMessage}`,
					{ itemIndex: index },
				);
			}
		}

		return text as T;
	}

	/**
	 * 解析字符串列表，支持数组、JSON 数组字符串、逗号分隔字符串
	 */
	static parseStringList(input: unknown, fieldName = 'list'): string[] {
		if (input === undefined || input === null || input === '') {
			return [];
		}

		if (Array.isArray(input)) {
			return input.map((id) => String(id).trim()).filter((id) => id);
		}

		const text = String(input).trim();
		if (!text) {
			return [];
		}

		if (text.startsWith('[')) {
			try {
				const parsed = JSON.parse(text);
				if (!Array.isArray(parsed)) {
					throw new Error('Expected JSON array');
				}
				return parsed.map((id: unknown) => String(id).trim()).filter((id: string) => id);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				throw new Error(`Failed to parse ${fieldName} JSON list: ${errorMessage}`);
			}
		}

		return text
			.split(',')
			.map((id) => id.trim())
			.filter((id) => id);
	}
}

export default NodeUtils;
