
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */

/**
 * 关于 async defer 的描述, 参见 ./i-script-descriptor.d.ts 
 */

/**
 * 内嵌( js 可执行字符串)型 script 节点描述符接口, 继承于 IDescriptorBasic
 * 在此配置 async 是有意义的, 因为可以采用变通方法, 将其转换为外链型.
 * 注意, 它的继承路径是: 
 * 			IScriptContentDescriptor ==> IDescriptorBasic. 
 * 而 IScriptUrlDescriptor 则是:
 * 			IScriptUrlDescriptor ==> IFiledDescriptor ==> IDescriptorBasic
 */
interface IScriptContentDescriptor extends IDescriptorBasic {
	/**
	 * script 标签名, 只可能是 script
	 */
	tag: "script";
	/**
	 * 与 textContent 类似, 用于设置文本内容. 
	 * 但在节点插入到 DOM 后, 被解析为可执行代码.
	 * 注意 src 与 text  两者应该也只能定义一个.
	 */
	text: string;
	/**
	 * 因与 text 互斥, IScriptContentDescriptor 不能包含 src 
	 */
	src?: never;
	/**
	 * 配置 async 是有意义的. 要达到异步效果, 可以采用变通方法, 将其转换为非内联形式
	 */
	async?: boolean;
	/**
	 * 标明这个脚本在支持 ES2015 modules 的浏览器中不执行. 即在不支持 modules 的浏览器中,
	 * module 脚本被抑制, 转而执行标有 nomodule 的脚本.
	 * default to false
	 */
	nomodule?: boolean;
	/**
	 * 对内联脚本使用的加密白名单, 不常用, 保持未定义即可
	 */
	nonce?: string;
}
