//import BaseComponent from "bootstrap/js/dist/base-component";

/**
 * 记录 bootstrap 组件的名称(在触发者的 data-bs-toggle 中使用的), 和对应的构造器(首字母大写的 class 名称)
 */
type BsComInfo = {
	/**
	 * 组件的名称, 与 data-bs-toggle 属性值相同
	 */
	name: string;

	/**
	 * 组件的 class 名称
	 */
	constructor: string;
};
/**
	Bootstrap 组件的触发显示, 当触发者动态形成, 动态撤销, 动态改变目标, 需要自适应, 通过 target 或 href 指定的选择器, 适用于触发者和目标组件分离的情况
	可以触发多个元素.
	以便事件监听和移除精准. 适用于触发器与组件分离, 且 bootstrap 说明, 
	"出于性能考虑, 需要手工初始化"的组件(原文: ... opt-in for performance reasons, so you must initialize them yourself.). 经多方查证, 这里的初始化, 其实应该是触发者, 而不是目标组件.
	目前登记在案的组件包含:
		toast, 

	注意: 
	1. 对于触发者不需要初始化的组件, 例如:
	 1) accordion 内部的 dropdown 触发者, 
	 2) dropdown-menu 的 dropdown 触发者, 
	 3) collapse 的触发者,
	 4) modal 的触发者,
	 5) offcanvas 的触发者
	 6) tab 的触发者
	这些组件不需要(也不应该)在 DynamicBootstrapObjectTogglerManager 中接受管理

	2. 而触发者和组件为一体的, 同时又需要手工初始化的组件, 例如:
	 1) popover
	 2) scrollspy ( 原版无 data-bs-toggle 标记, 因为已经使用了 data-bs-spy.)
	则需要登记在 DynamicBootstrapObjectManager 中接受管理

	使用方法: 
			DynamicBootstrapObjectTogglerManager.instance.start();
 */
class DynamicBootstrapObjectTogglerManager {

	private static _instance = new this();
	public static get instance() {
		//return DynamicBootstrapObjectTogglerManager._instance; // ok
		return this._instance; // ok too
	}
	/**
	 * 组件的显示, 依靠该 css 类, 默认情况下, 无此 class, 则隐藏
	 */
	private readonly SHOW_CLASS = "show";

	/**
	 * 触发者使用属性来标志引发何种组件的显示/隐藏
	 */
	private readonly BS_TOGGLER = "data-bs-toggle";

	/**
	 * 触发者使用此 data-bs-* 属性来标志, 将引发该选择器所指向的所有元素的显隐, 可以是多个
	 */
	private readonly BS_TARGET = "data-bs-target";

	/**
	 * 触发者使用此 html 属性来标志, 将引发该选择器所指向的所有元素的显隐, 
	 * 一般用作 anchor 元素, 但也可用于其他元素. 也可以是多个
	 */
	private readonly H_HREF = "href";

	/**
	 * 属性变化引发事件, 过滤为只关注这些属性
	 */
	private readonly ATTR_FILTERS = [
		this.BS_TOGGLER,
	];

	/**
	 * 在此登记在 html 页面, 需要关注 data-bs-toggle 为哪些值(即何种 bs 组件). 
	 */
	private readonly BS_COMS = [
		{
			name: "toast",
			constructor: "Toast",
		}
	];

	/**
	 * 根观察包装器使用的选择器
	 */
	private readonly ROOT_SEL = 'body';

	/**
	 * 根观察包装器
	 */
	private readonly _rootObsWrp: ObserverWrapper;

	/**
	 * 触发器被点击时的处理器, 以字段保存, 是为了方便安装与卸载
	 */
	private readonly _toggleHandler: (evt: MouseEvent) => void;
	/**
	 * 初始化观察包装器及列表
	 */
	private constructor() {
		this._rootObsWrp = new ObserverWrapper(this.ROOT_SEL);
		this._rootObsWrp.observerOptions.attributeFilter = this.ATTR_FILTERS;
		this._toggleHandler = this._toggleShow.bind(this);
	}

	/**
	 * 开始观察, 并通过事件监听, 实施必要的修正
	 * 经过反复调试, 已经核实, 目前无任何一次多余的重复修正, 即最精简的修正模式.
	 */
	public start() {
		this._rootObsWrp.onNodeAdded(evt => {
			if (this._isTrigger(evt.element)) {
				this._setupHandler(evt.element);
			}
		}).onAttributeChanged(evt => {

			// 注意: 设置的属性, 有可能与原来的相等. 这时候, 仍然会引发 attributeChanged
			// 见 observer-wrapper.ts 的测试部分
			// 所以需要判断, 精简处理
			const o = evt.oldValue;
			const n = evt.newValue;
			if (o != n) {
				// 分四种情况, 用属性值是否属于范围
				// 1. 原来是, 现在也是: 即虽然目标组件类型变化(正常), 但其处理器仍然可用, 保持现状
				// 2. 原来不是, 现在也不是: 保持现状
				// 3. 原来是, 现在不是: 需要卸载处理器
				// 4. 原来不是, 现在是: 需要安装处理器 
				if (this._verifyAttr(o) && !this._verifyAttr(n)) {
					this._setupHandler(evt.element, false);
				} else if (!this._verifyAttr(o) && this._verifyAttr(n)) {
					this._setupHandler(evt.element);
				}
			}
		}).start();

		// 初始化现存的 toggler
		let selector = "";
		this.BS_COMS.forEach(com => {
			selector += `[${this.BS_TOGGLER}=${com.name}],`;
		});
		selector = selector.slice(0, -1);
		document.querySelectorAll(selector).forEach(ele => {
			this._setupHandler(ele);
		});
	}

	/**
	 * 停止所有观察
	 */
	public stop() {
		this._rootObsWrp.stop();
	}

	/**
	 * 安装或卸载事件处理器
	 * @param ele 为该元素安装
	 * @param setup 默认 true: 安装;  false: 卸载
	 */
	private _setupHandler(ele: Element, setup: boolean = true) {
		const hele = ele as HTMLElement;
		if (hele) {
			console.info(`${setup ? "install" : "uninstall"} toggler handler for one element`);
			//@ts-ignore
			hele[setup ? "addEventListener" : "removeEventListener"]('click', this._toggleHandler);
		}
	}

	/**
	 * 指定元素是登记在案的 trigger 吗?
	 * @param ele 元素
	 * @returns true: 是; false: 不是
	 */
	private _isTrigger(ele: Element) {
		return this._verifyAttr(ele.getAttribute(this.BS_TOGGLER));
	}

	/**
	 * 给定的属性值是否合格(登记在案)
	 * @param v 属性值
	 * @returns true: 是; false: 不是
	 */
	private _verifyAttr(v: string | null) {
		//	return this.COM_NAMES.indexOf(v || "") != -1;
		// const result = this.BS_COMS.find(info => info.name == v);
		// return  result != undefined && result != null;
		return this.BS_COMS.find(info => info.name == v) != undefined;
	}

	/**
	 * 查询触发器所指目标对象的构造函数名称, 即 class 名
	 * @param ele 触发者
	 * @returns 目标对象的构造函数名称, 即 class 名
	 */
	private _queryContructorName(ele: Element) {
		const com_name = ele.getAttribute(this.BS_TOGGLER);
		const com = this.BS_COMS.find(com => com.name == com_name);
		return com ? com.constructor : "";
	}

	/**
	 * 切换目标元素的显隐
	 * @param evt 事件
	 */
	private _toggleShow(evt: MouseEvent) {
		const trigger = evt.target as Element;
		if (trigger) {
			const ctor = this._queryContructorName(trigger).trim();
			const selector = trigger.getAttribute(this.BS_TARGET) || trigger.getAttribute(this.H_HREF);
			// 注意此时的 id 有前缀 #, 是选择符格式
			if (ctor.length > 0 && selector) {
				// 可能有多个目标
				document.querySelectorAll(selector).forEach(target => {
					// 如果简单的使用 target.classList.toggle("show");, 
					//则目标的 delay 不起作用, 即不会自动关闭					
					const bsObj = this._refreshTargetComponent(target, ctor);
					//@ts-ignore
					//const bsObj = bootstrap[ctor].getOrCreateInstance(target);
					if (target.classList.contains(this.SHOW_CLASS)) {
						bsObj.hide();
					} else {
						bsObj.show();
					}
				});
			}
		}
	}

	/**
	 * 刷新目标元素对应的 bootstrap 组件, 主要是为了让目标元素的一些属性变化, 及时反应到组件中
	 * getOrCreateInstance 无法应对此变化, 例如 autohode .
	 * @param target 目标元素
	 * @param ctor 构造器, 即目标元素对应的组件 class　名称
	 * @returns 更新后的　bootstrap 组件
	 */
	private _refreshTargetComponent(target: Element, ctor: string) {
		// 发现如果销毁原来的, 会导致 target 本身的某些属性出现问题而不能正常显隐.
		//@ts-ignore
		// let bsObj = bootstrap[ctor].getInstance(target);
		// if (bsObj) {
		// 	bsObj.dispose();
		// }
		//@ts-ignore
		return new bootstrap[ctor](target);
	}
}

// DynamicBootstrapObjectTogglerManager.instance.start();