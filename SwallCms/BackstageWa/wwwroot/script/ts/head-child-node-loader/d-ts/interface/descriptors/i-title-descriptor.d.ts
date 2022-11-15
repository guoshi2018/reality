
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */

/**
 * title 节点描述符接口.继承于 IDescriptorBasic
 */
interface ITitleDescriptor extends IDescriptorBasic {
	/**
	 * title 元素标签名, 只可能是 title
	 */
	tag: "title",
	/**
	 * 这个接口太简单, 没有多余字段, 就一个标签之间的文本
	 * 该字段被添加到 node, 作为其 js 同名属性, 继而反映到节点的内部文本,
	 * 注意没有对应到 node 的 attribute.
	 * 定义文档的标题，显示在浏览器的标题栏或标签页上。它只应该包含文本，
	 * 若是包含有标签，则它包含的任何标签都将被忽略。
	 * 与 <base> 一样, 只能定义一次, 后续定义被忽略
	 * 默认文档 url, 与 <base> 之 href 默认值一致(浏览器默认即如此)
	 */
	textContent?: string;
}