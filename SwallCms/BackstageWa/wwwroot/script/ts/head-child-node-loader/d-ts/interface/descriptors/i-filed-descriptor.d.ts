/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */

/**
 * 文件型描述符接口, 继承于 IDescriptorBasic, 为 link 及 链接式(非内嵌式) script 标签, 提供公用特征 
 */
interface IFiledDescriptor extends IDescriptorBasic {
	/**
	 * 配置元素获取数据的 CORS 请求, undefined to "" (等效于 "anonymous")
	 */
	crossorigin?: LinkScriptCorg;
	/**
	 * 分成两个部分，第一部分指定哈希值的生成算法（目前支持 sha256、sha384 及 sha512），
	 * 第二部分是经过 base64 编码的实际期望的哈希值，两者之间通过一个短横（-）分割。
	 * 浏览器在 <script> 或者 <link> 标签中遇到 integrity 属性之后，
	 * 会在执行脚本或者应用样式表之前, 对比所加载文件的计算哈希值和期望哈希值是否一致,
	 * 不一致时，浏览器必须拒绝执行脚本或者应用样式表，并且必须返回一个网络错误说明获得
	 * 脚本或样式表失败。 default to undefined
	 */
	integrity?: string;
	/**
	 * 指示在获取资源时使用哪个引荐来源网址 undefined to "no-referrer-when-downgrade"
	 */
	referrerpolicy?: LinkScriptRefPlc;
	/**
	 * MIME 类型
	 * 对于 link, 为链接的内容的类型, undefined to text/css;
	 * 对于 script, 为脚本语言类型, undefined to text/javascript
	 */
	type?: HtmlMime;
}