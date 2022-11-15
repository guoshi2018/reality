
功能:
	1. 动态加载(添加) html/head 部分的子节点, 目前可兼容 script(链接文件或内嵌式), link, base, title, meta.
	2. 加载成功或失败, 调试状态下, 控制台有详细说明
	3. config/global.ts, 非必要不要打开 forceDebug 强制调试开关
	4. 比较 jscss-loader 和 page-resource-loader, 效率更高(甚至还可以监听 window 的 load 事件), 功能
		上是这两者的超集.

如何使用?
	1. 创建 ts(js) 文件, 写入:
		 import Kmt from "{path}/head-child-node-loader.js";
		 Kmt.start({...})
		其中的参数可查阅方法注解, 然后在入口函数写入业务逻辑
	2. html/head 处, 添加唯一脚本 <script type="module" src="{url}"  flag="load-head" ></script> ,其中{url}
		表示上述的本地的 js 文件. 注意 flag 要与 config/global.ts 的 defaltFlag 对应
	3. 配置 release:true, 会移除所有动态加载的 script 节点(其余不变)
	4. 如果动态加载内容太多, 可能会导致错过 window 的 onload 事件. 


如果扩展? 已添加 head 子标签 xxx 为例
	1. d-ts/interface 目录: 创建 IXxxDescriptor extends IDescriptorBasic 
	2. d-ts/type.d.ts : type IAnyDescriptor = {...}, 添加刚创建的 interface 
	3. config/default-descriptors.ts: 创建相应的默认值, 注意与基类接口默认值合并, 以及添加到 export
	4. 完工. 接着可以在 HeadChildNodeLoader.start() 中添加需要添加的 xxx 标签:{tag:"xxx",...,...},测试