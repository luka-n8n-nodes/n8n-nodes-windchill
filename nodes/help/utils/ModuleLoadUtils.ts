/**
 * @deprecated 已改用静态 ResourceRegistry，保留空壳避免外部引用报错。
 */
class ModuleLoadUtils {
	static loadModules(_dirPath: string, _expression: string): never {
		throw new Error(
			'ModuleLoadUtils.loadModules is removed. Use ResourceRegistry / ResourceFactory.build() instead.',
		);
	}
}

export default ModuleLoadUtils;
