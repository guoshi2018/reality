
/**
 * 加载器的启动选项
 */
interface IStartOptions {
	/**
	 * 是否放弃全局定义的资源加载, default to false
	 */
	abandonGlobal?: boolean;
	/**
	 * 本地定义的资源集, 默认空数组
	 */
	localStuffs?: IAnyDescriptorOrString[][];
	/**
	 * 当前是否release状态
	 */
	release?: boolean;
	/**
	 * 入口方法, 默认打印加载的节点结果, 并提示当前的入口文件路径
	 */
	entry?(): void;
}