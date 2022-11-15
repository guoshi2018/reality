
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */

/**
 * 所有描述符接口的根基类描述符接口: 用于描述 head 所有子节点应包含的特征 
 */
interface IDescriptorBasic {
	/**
	 * 超时时限, 即设定一个毫秒数, 该节点在此时限内不能完成加载, 则判定失败.
	 * 仅在 willTriggerLoadOrError 为 true 时有效
	 */
	timeout?: number;
	/**
	 * 该 child node 是否触发加载成功或错误事件, 文件型和非文件型有一定区别 
	 */
	willTriggerLoadOrError?: boolean;
}
