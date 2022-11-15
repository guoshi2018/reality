
import config from "../config/global.js";


/**
 * 描述符对象工厂
 */
export default class HeadChildNode {

	/**
	 * 记录该节点被附加(加载)的结果: 成功或失败
	 */
	protected _attachResult?: IAttachResult;
	/**
	 * 获取该节点被附加(加载)的结果: 成功或失败
	 */
	public get attachResult() { return this._attachResult; }

	/**
	 * 节点的对应描述符接口配置, 该配置已经过修缮
	 * (例如: async text script 变通, 纯字符串变通, 未指定的默认值应用)
	 */
	protected _descriptor: IAnyDescriptor;

	/**
	 * 加载节点, 即唯一需要使用 <script> 标签手工引入到 html/head 节区
	 * 的 script 节点对象
	 */
	private static _loaderNode?: HTMLScriptElement;
	/**
	 * 获取加载节点, 即唯一需要使用 <script> 标签手工引入到 html/head 节区,
	 * 附有自定义属性 flag=<配置文件中记录的标志> 的 script 节点对象
	 */
	public static get loaderNode(): HTMLScriptElement {
		if (!this._loaderNode) {
			let ele_jss = document.getElementsByTagName('script');
			this._loaderNode = [...ele_jss].find(
				ele => ele.getAttribute("flag") == config.defaultFlag && ele.type == "module"
			);
			if (!this._loaderNode) {
				throw new Error('未知错误, 无法查找加载器对应的 script 节点');
			}
		}
		return this._loaderNode;
	};

	/**
	 * 当前描述符接口对应的 head 内的子节点
	 */
	protected _node: HTMLHeadChildElement;
	/**
	 * 获取当前描述符接口对应的 head 内的子节点
	 */
	public get node() { return this._node; }


	/**
	 * 如果是内嵌型 script, 且标注为异步执行, 则将其转换为外链型脚本并返回, 以达到异步执行的目的
	 * @param descriptor 可能需要转换的节点描述符接口.
	 * @returns 如果是内嵌型 script, 且标注为异步执行, 则转换后返回; 
	 * 	如果不是则不执行任何操作, 原样返回给定的节点描述符接口
	 */
	private _toScriptUrlIfAsyncScriptContent(descriptor: IAnyDescriptor): IAnyDescriptor {
		let newlyDrt: IAnyDescriptor = descriptor;
		if (descriptor.tag == "script" && !("src" in descriptor)
			&& descriptor.text.length > 0 && descriptor.async == true) {

			// 内嵌 script, 需要变通一下, 才能异步执行
			// 1. 全部拷贝到 IScriptUrlDescriptor, 同时配置 src
			// 2. 去掉 IScriptUrlDescriptor 不允许的 text/async 属性
			newlyDrt = Object.assign({}, descriptor, {
				src: URL.createObjectURL(new Blob([descriptor.text])),
			}) as IScriptUrlDescriptor;
			Reflect.deleteProperty(newlyDrt, "text");
			Reflect.deleteProperty(newlyDrt, "async");
		}
		return newlyDrt;
	}

	/**
	 * 根据指定的描述符接口(其中包含显示指定或默认的 tag )或者路径字符串, 
	 * 创建对应的描述符对象, 主要工作室整顿描述符
	 * @param descriptor 指定的描述符接口(其中包含显示指定或默认的 tag )或者路径字符串
	 * @returns 描述符对象
	 * @remark 注意, 
	 * 	1. 描述符接口作为参数时, 配合默认值, 进一步生成更具体的可用的描述符
	 * 	2. 字符串作为参数时, 
	 * 		1) 凡是以 .js 结尾的, 解析为 script; 
	 * 		2) 其他, 解析为 link
	 */
	public constructor(descriptor: IAnyDescriptorOrString) {
		let defaultDescriptor, currDescriptor: IAnyDescriptor;

		if (typeof descriptor == 'object') {
			// HeadChildNodeLoader.start 方法参数虽然做了类型设置, 但是仍然可以漏了 tag 字段
			// 而不报错, 所以, 这里有必要强制设定一默认标签
			descriptor.tag || Reflect.defineProperty(descriptor, "tag", {
				value: config.defaultTag,
				writable: false,
				enumerable: true,
				configurable: true,
			});
			currDescriptor = this._toScriptUrlIfAsyncScriptContent(descriptor);

			// script 有两种接口: IScriptUrlDescriptor 和 IScriptContentDescritor 需要区分
			// if (currDescriptor.tag == "script") {
			// 	defaultDescriptor = "src" in currDescriptor ?
			// 		config.defaultDescriptors.defaultScriptUrl :
			// 		config.defaultDescriptors.defaultScriptContent;
			// } else {
			// 	defaultDescriptor = [...Object.values(config.defaultDescriptors)].find(drt => 				
			// 		// meta 虽然有三种接口: IMetaNameDescriptor, IMetaHttpEquivDescriptor 和 
			// 		// IMetaPropertyDescriptor 但是它们共用一个默认描述符接口, 所以不需要一一区分
			// 		currDescriptor.tag == drt.tag
			// 	);				
			// }

			// 与上面等效
			defaultDescriptor = currDescriptor.tag == "script" ?
				config.defaultDescriptors["src" in currDescriptor ? "defaultScriptUrl" : "defaultScriptContent"] :
				[...Object.values(config.defaultDescriptors)].find(drt =>
					// meta 虽然有三种接口: IMetaNameDescriptor, IMetaHttpEquivDescriptor 和 
					// IMetaPropertyDescriptor 但是它们共用一个默认描述符接口, 所以不需要一一区分
					currDescriptor.tag == drt.tag
				);

			if (!defaultDescriptor) {
				console.error("error descriptor:", descriptor);
				throw new Error("one descriptor error at least");
			}
		} else {
			if (descriptor.endsWith('.js')) {
				currDescriptor = { src: descriptor, tag: "script" } as IScriptUrlDescriptor;
				defaultDescriptor = config.defaultDescriptors.defaultScriptUrl;
			} else {
				currDescriptor = { href: descriptor, tag: "link" } as ILinkDescriptor;
				defaultDescriptor = config.defaultDescriptors.defaultLink;
			}
		}
		this._descriptor = Object.assign({}, defaultDescriptor, currDescriptor);
		this._node = document.createElement(this._descriptor.tag);
		Object.assign(this._node, this._descriptor);
	}


	/**
	 * 将描述符对象对应的 node, 异步添加到 head 节区
	 * @returns 承诺, 该承诺代表(包含) node 加载的结果(成功/失败)及其原因等信息
	 * @remark 注意, 如果 head 内已经包含欲新增 node 的超集(从节点 attributes 上看),
	 *  则放弃添加该 node, 并在 返回的 promise result 中做好记录
	 */
	public attachAsync(): Promise<IAttachResult> {
		const node = this._node;
		const commonOpt = {
			descriptor: this._descriptor,
			node,
		};

		return this._isSameNodeExist2() ?
			new Promise<IAttachResult>((resolve,
				reject: (reason: IAttachResult | PromiseLike<IAttachResult>) => void) => {
				reject(this._attachResult = Object.assign({}, commonOpt, {
					error: 101, message: "abandon to attach, for at least one duplicate node found.",
				}) as IAttachResult);
			}) :
			new Promise<IAttachResult>((resolve, reject: (reason: IAttachResult) => void) => {
				HeadChildNode.loaderNode.before(node);


				if (this._descriptor.willTriggerLoadOrError) {

					// 需要监听 load 事件的节点
					node.addEventListener('load', (evt: Event) => {
						resolve(this._attachResult = Object.assign({}, commonOpt, {
							error: 0, message: "loaded successfully"
						}) as IAttachResult);
					});
					node.addEventListener('error', (evt: Event) => {
						//错误,例如文件不存在
						//node.remove(); // 这样会移除其他加载成功的节点
						reject(this._attachResult = Object.assign({}, commonOpt, {
							error: 102, message: "failed to load, for an unexpected error has occurred while loading, perhaps file not found!"
						}) as IAttachResult);
					});

					//如果上述'load'或'error'事件在this._timeout定义的时限内被成功监听,
					//则下面的超时丢弃将不被引发
					setTimeout(() => {
						//node.remove();
						reject(this._attachResult = Object.assign({}, commonOpt, {
							error: 103, message: "sorry, load timeout."
						}) as IAttachResult);
					}, this._descriptor.timeout);		//超时
				} else {
					// script link 以外的标签加载完成, 不引发 load 事件,
					// 如果不过滤出来, 只会误落超时噩梦
					resolve(this._attachResult = Object.assign({}, commonOpt, {
						error: 200, message: "unknown result without loaded event listened."
					}) as IAttachResult);
				}
			});
	}

	/**
	 * 是否已经存在与要新增的节点雷同的节点
	 * @returns 存在返回 true, 否则返回 false
	 * @remark 判定原理:
	 * 	1. tag 相同,
	 * 	2. 已存在节点的所有 attributte, 在欲新增节点上, 均能找到同名同值.
	 * 注意, 只是限于 html 标签内的属性, node 自身的 javascript 属性, 都不做检查条件
	 */
	private _isSameNodeExist1() {
		const newAttrs = [...this._node.attributes];
		return [...document.head.children].findIndex(node =>
			node.tagName == this._node.tagName &&
			node.textContent == this._node.textContent &&
			[...node.attributes].every(exsAttr =>
				newAttrs.findIndex(attr =>
					exsAttr.value == attr.value && exsAttr.name == attr.name) != -1)
		) != -1;
	}

	/**
	 * 是否已经存在与要新增的节点雷同的节点
	 * @returns 存在返回 true, 否则返回 false
	 * @remark 判定原理:
	 * 	1. tag 相同,
	 * 	2. 欲新增节点的所有 attributte, 在已存在节点上, 均能找到同名同值.
	 * 注意, 只是限于 html 标签内的属性, node 自身的 javascript 属性, 都不做检查条件
	 * 检查逻辑与 _isSameNodeExist1 颠倒.
	 * 
	 */
	private _isSameNodeExist2() {
		const newAttrs = [...this._node.attributes];
		return [...document.head.children].findIndex(node =>
			node.tagName == this._node.tagName &&
			node.textContent == this._node.textContent && // js 可以利用 text 立即执行
			newAttrs.every(attr =>
				[...node.attributes].findIndex(extAttr =>
					extAttr.value == attr.value && extAttr.name == attr.name) != -1)
		) != -1;
	}

	/**
	 * 鉴于雷同鉴别可能会误判, 又是应该采用此方法替换, 不作鉴别.
	 */
	private _isSameNodeExist3() {
		return false;
	}
}