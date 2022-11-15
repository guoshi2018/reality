
//#region node added event & callback
type ObserverWrapperNodeAddedEvent = {
	readonly element: HTMLElement,
	readonly addedChild: HTMLElement,
	readonly prevOfList: HTMLElement | null,
	readonly nextOfList: HTMLElement | null,
};

type ObserverWrapperNodeAddedCallback =
	(evt: ObserverWrapperNodeAddedEvent) => void;
//#endregion

//#region node removed event & callback
type ObserverWrapperNodeRemovedEvent = {
	readonly element: HTMLElement,
	readonly removedChild: HTMLElement,
	readonly prevOfList: HTMLElement | null,
	readonly nextOfList: HTMLElement | null,
};

type ObserverWrapperNodeRemovedCallback =
	(evt: ObserverWrapperNodeRemovedEvent) => void;
//#endregion

//#region attribute changed event & callback
type ObserverWrapperAttributeChangedEvent = {
	readonly element: HTMLElement,
	readonly attrName: string | null,
	readonly space: string | null,
	readonly oldValue: string | null,
	readonly newValue: string | null,
};

type ObserverWrapperAttributeChangedCallback =
	(evt: ObserverWrapperAttributeChangedEvent) => void;
//#endregion

//#region characterData changed event & callback
type ObserverWrapperCharacterDataChangedEvent = {
	readonly element: HTMLElement,
	readonly oldValue: string,
	//这个定义也许可以商榷
	readonly newValue: string,
};

type ObserverWrapperCharacterDataChangedCallback =
	(evt: ObserverWrapperCharacterDataChangedEvent) => void;
//#endregion


/**
 * 观察包装器, 内部采用 MutationObserver 机制, 将繁杂的判断操作封装起来,
 * 以简单易用的 event 模型, 提供给外界使用. 类似于 win32 时代的 c/Assembly
 * 语言的 windows 消息响应, 封装后成 c++ 的 onXXX 事件模型. 
 * 注意, 各种得到的观察结果, 具有不同的事件参数. 
 */
class ObserverWrapper {

	/**
	 * 指定观察范围的选择器
	 */
	protected _selector: string;

	/**
	 * 保存被监视元素的列表, 如果需要.
	 */
	//protected _nodeSet: LiveSet<HTMLElement>;

	/**
	 * 观察者, 一个可以观察多个元素
	 */
	protected _observer: MutationObserver;

	/**
	 * 观察选项
	 */
	protected _observerOptions: MutationObserverInit;

	/**
	 * 节点添加回调函数列表
	 */
	protected _nodeAddedCallbacks: Set<ObserverWrapperNodeAddedCallback>;

	/**
	 * 节点移除回调函数列表
	 */
	protected _nodeRemovedCallbacks: Set<ObserverWrapperNodeRemovedCallback>;

	/**
	 * html属性改变回调函数列表
	 */
	protected _attributeChangedCallbacks: Set<ObserverWrapperAttributeChangedCallback>;

	/**
	 * characterData改变回调函数列表
	 */
	protected _characterDataChangedCallbacks: Set<ObserverWrapperCharacterDataChangedCallback>;

	/**
	 * 获取观察选项, 以便逐个字段修改. 默认值如下:
	 * 	attributes: true,
	 * 	attributeOldValue: true,
	 * 	characterData: true,
	 * 	characterDataOldValue: true,
	 * 	childList: true,
	 * 	subtree: true, 
	 * 	在 start 对其修改生效.
	 * 	注意取消的选项和能否正常回调的关系
	 */
	public get observerOptions() {
		return this._observerOptions;
	}

	/**
	 * 设置观察选项, 以便整体更换. 默认值如下:
	 * 	attributes: true,
	 * 	attributeOldValue: true,
	 * 	characterData: true,
	 * 	characterDataOldValue: true,
	 * 	childList: true,
	 * 	subtree: true, 
	 * 	在 start 对其修改生效, 
	 * 	注意取消的选项和能否正常回调的关系
	 */
	public set observerOptions(value) {
		this._observerOptions = value;
	}

	/**
	 * 创建观察包装器对象, 内部进行的初始化工作如下:
	 * 准备监视元素列表, 监视器, 监视选项, 四个回调函数列表
	 * @param selector 承诺初始监视范围的元素选择符, 可能包括后代各级, 由
	 * 	监视选项的 subtree 决定
	 */
	public constructor(selector: string) {
		this._selector = selector;
		this._observer = new MutationObserver(this._observeCallback.bind(this));
		this._observerOptions = {
			attributes: true,
			attributeOldValue: true,
			characterData: true,
			characterDataOldValue: true,
			childList: true,
			subtree: true,
		}
		this._nodeAddedCallbacks = new Set<ObserverWrapperNodeAddedCallback>([]);
		this._nodeRemovedCallbacks = new Set<ObserverWrapperNodeRemovedCallback>([]);
		this._attributeChangedCallbacks = new Set<ObserverWrapperAttributeChangedCallback>([]);
		this._characterDataChangedCallbacks = new Set<ObserverWrapperCharacterDataChangedCallback>([]);
	}

	/**
	 * 为监听列表中的元素启动监听; 配置列表元素添加事件响应: 将新元素纳入监听范围 
	 * @returns 对象自身, 以便链接调用其他方法
	 */
	public start() {
		document.querySelectorAll(this._selector).forEach(ele => {
			this._observer.observe(ele, this._observerOptions);
		})
		return this;
	}

	/**
	 * 添加观察目标, 注意可临时更改观察选项
	 * @param target 要添加的目标节点
	 */
	public observeNode(target: Node) {
		this._observer.observe(target, this._observerOptions);
	}

	/**
	 * 停止 mutation 的事件监听
	 * @returns 对象自身, 以便链接调用其他方法
	 */
	public stop() {
		const restRcd = this._observer.takeRecords();
		this._observeCallback(restRcd, this._observer);
		this._observer.disconnect();
		return this;
	}

	/**
	 * 监听 nodeAdded 事件
	 * @param callback 监听回调函数
	 * @returns 对象自身, 以便链接调用其他方法
	 */
	public onNodeAdded(callback: ObserverWrapperNodeAddedCallback) {
		this._nodeAddedCallbacks.add(callback);
		return this;
	}
	public offNodeAdded(callback: ObserverWrapperNodeAddedCallback) {
		this._nodeAddedCallbacks.delete(callback);
		return this;
	}

	/**
	 * 监听 nodeRemoved事件
	 * @param callback 监听回调函数
	 * @returns 对象自身, 以便链接调用其他方法
	 */
	public onNodeRemoved(callback: ObserverWrapperNodeRemovedCallback) {
		this._nodeRemovedCallbacks.add(callback);
		return this;
	}
	public offNodeRemoved(callback: ObserverWrapperNodeRemovedCallback) {
		this._nodeRemovedCallbacks.delete(callback);
		return this;
	}

	/**
	 * 监听 attributedChanged 事件
	 * @param callback 监听回调函数
	 * @returns 对象自身, 以便链接调用其他方法
	 */
	public onAttributeChanged(callback: ObserverWrapperAttributeChangedCallback) {
		this._attributeChangedCallbacks.add(callback);
		return this;
	}
	public offAttributeChanged(callback: ObserverWrapperAttributeChangedCallback) {
		this._attributeChangedCallbacks.delete(callback);
		return this;
	}

	/**
	 * 监听 characterDataChanged 事件
	 * @param callback 监听回调函数
	 * @returns 对象自身, 以便链接调用其他方法
	 */
	public onCharacterDataChanged(callback: ObserverWrapperCharacterDataChangedCallback) {
		this._characterDataChangedCallbacks.add(callback);
		return this;
	}

	/**
	 * 将原生的回调函数参数, 针对不同事件, 分解/组合成简单易用, 强大的各个
	 * 事件下不同的事件参数.　原生的观察回调函数, 类似于 win32 的消息机制
	 * @param mutations 代表一个独立的 DOM 变化.
	 * @param observer 核心观察者
	 */
	protected _observeCallback(mutations: MutationRecord[], observer: MutationObserver) {

		mutations.forEach(mut => {
			const element = mut.target as HTMLElement;
			switch (mut.type) {
				case "childList":
					mut.addedNodes.forEach(ele => {
						this._nodeAddedCallbacks.forEach(cb => cb({
							element,
							addedChild: ele as HTMLElement,
							prevOfList: mut.previousSibling as HTMLElement,
							nextOfList: mut.nextSibling as HTMLElement,
						}), this);
					});
					mut.removedNodes.forEach(ele => {
						this._nodeRemovedCallbacks.forEach(cb => cb({
							element,
							removedChild: ele as HTMLElement,
							prevOfList: mut.previousSibling as HTMLElement,
							nextOfList: mut.nextSibling as HTMLElement,
						}), this);
					});
					break;
				case "attributes":
					this._attributeChangedCallbacks.forEach(cb => cb({
						element,
						attrName: mut.attributeName,
						space: mut.attributeNamespace,
						oldValue: mut.oldValue,
						newValue: element.getAttribute(mut.attributeName || ""),
					}), this);
					break;
				case "characterData":
					this._characterDataChangedCallbacks.forEach(cb => cb({
						element,
						oldValue: mut.oldValue || "",
						//这个定义也许可以商榷
						newValue: element.innerHTML,
					}), this);
					break;
				default:
					break;
			}
		})
	}
}





//test
// (() => {
// 	const w = new ObserverWrapper('body');
// 	w.onNodeAdded(evt => {
// 		console.log(`${evt.addedChild.tagName} added to ${evt.element.tagName}`)
// 	}).onNodeRemoved(evt => {
// 		console.log(`${evt.removedChild.tagName} removed from ${evt.element.tagName}`);
// 	}).onAttributeChanged(evt => {
// 		//注意: 设置的属性, 有可能与原来的相等.这时候, 仍然会引发 attributeChanged
// 		console.log(`${evt.element.tagName} ${evt.attrName}: <${evt.oldValue}> -> <${evt.newValue}>`);
// 	}).onCharacterDataChanged(evt => {
// 		console.log(`${evt.element.tagName} character data changed: <${evt.oldValue}> -> <${evt.newValue}>`);
// 	}).start();
// })();
