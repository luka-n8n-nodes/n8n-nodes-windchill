import ResourceBuilder from './ResourceBuilder';
import { buildFromRegistry } from './ResourceRegistry';

class ResourceFactory {
	/**
	 * 构建资源注册表。basedir 参数保留以兼容旧调用方，实际使用静态注册表。
	 */
	static build(_basedir?: string): ResourceBuilder {
		return buildFromRegistry();
	}
}

export default ResourceFactory;
