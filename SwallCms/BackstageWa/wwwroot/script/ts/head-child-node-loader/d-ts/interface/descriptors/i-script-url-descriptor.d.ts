
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */

/**
 * 关于 async defer 的简述
 * 一. 硬编码到 html/head 中:
 * 		1. 普通脚本 <script src="..."></script>
 * 			1) 无 async 和 defer: 阻塞执行
 * 			2) 只有 async: 并行请求解析执行
 * 			3) 只有 defer: 延缓至文档完成解析后, DOMContentLoaded事件前执行, 
 * 				所以在脚本加载完成前, 它会阻塞该事件. (以下简称延缓执行)
 * 			4) 同时有 async defer: 因 defer 优先级较低而被忽略. 但在不支持 async 的
 * 				浏览器中, 会生效, 而导致脚本的延缓执行
 * 		2. 模块脚本 <script type="module" src="..."></script>
 * 			1) 模块脚本默认 defer, 而延缓执行.
 * 			2) 带有 async (不论是否有 defer), 并行请求解析执行
 * 		3. 内嵌脚本 <script>code...</script>, 不论是否包含 async defer, 始终是阻塞执行 
 * 二. 动态添加到 html/head 中:
 * 		1. 非内联(普通和模块)脚本 <script [type="module"] [async/defer] src="..."></script> 
 * 			不论是否包含 async defer, 是否模块, 始终是异步执行.
 * 		2. 内联(普通和模块)脚本 <script [type="module"] [async/defer]>code</script>,
 * 			不论是否包含 async defer, 是否模块, 始终是阻塞执行
 * 		3. 鉴于 1 和 2 的蛮不讲理的特点, 如果想让内联脚本异步执行, 则必须做变通处理:
 * 			var blob = new Blob([codeString]);
 * 			var script = document.createElement('script');
 * 			var url = URL.createObjectURL(blob);
 * 结论, haad-child-node-loader 形式的非内联脚本加载, async defer 已无配置意义, 因为它始终是
 * 异步的; 但是对于内联脚本, async 却有配置意义.
 */

/**
 * 引用外部文件 url 风格的 script 节点描述符接口, 继承于 IFiledDescriptor
 * 关于 async defer 的描述, 参见 ./i-script-descriptor.d.ts 
 * 在此配置 async 或 defer 是没有意义的, 因为动态加载的外链型 script, 永远是 async
 * 注意, 它的继承路径是: 
 * 			 IScriptUrlDescriptor ==> IFiledDescriptor ==> IDescriptorBasic
 * 而 IScriptContentDescriptor 则是:
 * 			IScriptContentDescriptor ==> IDescriptorBasic.
 */
interface IScriptUrlDescriptor extends IFiledDescriptor {
	/**
	 * script 标签名, 只可能是 script
	 */
	tag: "script";
	/**
	 * 定义引用外部脚本的 URI
	 */
	src: string;
	/**
	 * 因与 src 互斥, IScriptUrlDescriptor 不能包含 text
	 */
	text?: never;
	/**
	 * async 没有配置意义, 因 IScriptUrlDescriptor 形成的 script, 
	 * 一定是 async
	 */
	async?: never;
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

