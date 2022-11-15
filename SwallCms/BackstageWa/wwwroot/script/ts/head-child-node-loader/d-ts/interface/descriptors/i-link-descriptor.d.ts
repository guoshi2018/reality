
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */


/**
 * link 节点描述符接口, 继承于 IFiledDescriptor
 */
interface ILinkDescriptor extends IFiledDescriptor {
	/**
	 * link 元素标签名, 只可能是 link
	 */
	tag: "link";
	/**
	 * 指定被链接资源的URL。URL 可以是绝对的，也可以是相对的。
	 */
	href: string;
	/**
	 * 命名链接文档与当前文档的关系。该属性必须是链接类型值的用空格分隔的列表。
	 * https://developer.mozilla.org/zh-CN/docs/Web/HTML/Link_types
	 */
	rel?: string;
	/**
	 * 该属性仅在<link>元素设置了 rel="preload" 或者 rel="prefetch" 时才能使用。
	 * 它规定了<link>元素加载的内容的类型，对于内容的优先级、请求匹配、正确的内容
	 * 安全策略的选择以及正确的 Accept请求头的设置，这个属性是必需的
	 */
	as?: LinkAs;
	/**
	 * 仅对于rel="stylesheet" ，指示是否应加载所描述的样式表并将其应用于文档. 但是,
	 * 一旦加载样式表，对它所做的更改将不再与 StyleSheet.disabled 属性的值有任何关系
	 * default to false
	 */
	disabled?: boolean;
	/**
	 * 此属性指明了被链接资源的语言。其意义仅供参考. 保留 undefined 即可
	 */
	hreflang?: string;
	/**
	 * 资源的相对重要性, 仅 rel="preload" | "prefetch" 时有效. default to "auto"
	 */
	importance?: LinkImp;
	/**
	 * 规定了外部资源适用的媒体类型。它的值必须是"媒体查询", 否则无效. default to undefined
	 */
	media?: string;
	/**
	 * 只有在 rel 包含 icon 时有效。
	 * 定义了包含相应资源的可视化媒体中的可能是多个 icons 的大小。可能值:
	 * 	1) any 表示图标可以按矢量格式缩放到任意大小，例如 image/svg+xml。
	 * 	2) 一个由空白符分隔的尺寸列表, 表达多个 icon 的大小。每一个都以
	 * 		<width in pixels>x<height in pixels> 或 
	 * 		<width in pixels>X< in pixels> 给出。
	 * 尺寸列表中的每一个尺寸都必须包含在资源里。
	 * 苹果的 IOS 系统并不支持这个属性, 取而代之, 以 
	 * apple-touch-icon 和 apple-touch-startup-icon 设置. 
	 */
	sizes?: string;
	/**
	 * 与 rel 结合, 为浏览器 查看样式 菜单项, 提供样式选择.
	 * 1. 持久型样式: rel = "stylesheet", 总是应用.
	 * 2. 默认样式: rel = "stylesheet" && title = "AAA", 菜单项登记为 AAA
	 * 3. 替换样式: rel = "stylesheet alternate" && title = "BBB", 菜单登记为 BBB
	 * 总之, 不可能 rel = "alternate" 形式.
	 * 目前只发现 firefox 中可以找到该菜单项.
	 * default to undefined
	 */
	title?: string;
	/**
	 * 非标准属性: 提供有关可能在对象上执行的功能的信息
	 */
	methods?: string;
	/**
	 * 非标准属性: 此属性标识下一个导航可能需要的资源，用户代理应检索该资源。
	 * 这允许用户代理在将来请求资源时更快地做出响应。
	 */
	prefetch?: string;
	/**
	 * 非标准属性: 定义具有已定义链接关系或将显示任何链接资源的呈现的框架或窗口名称。
	 * default to undefined
	 */
	target?: string;
}

