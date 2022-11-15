

/**
 * 使用动态生成的select, 并通过右键点击选择元素, 达到为该元素添加/移除特征, 实时查看效果的目的.
 * 目前支援的特征有(使用中注意必须带圆括号):
 * 1. html 属性, 记做 h({...}){...}, 例如 disabled,checked 属性: h(disabled)true h(checked) h(max)15
 * 2. css class, 记做 c({...}), 例如 c(form-control) c(mx-auto) c(col)
 * 3. js 属性, 记做 j({...}){...}, 例如 j(indeterminate)true, j(xxx)123,j(yyy) ,因为类似这样的属性, 通过html设置无效.
 * 依赖: 
 * 		1. bootstrap的相关class, 主要用于动态生成的selector的默认class, 当然也可以
 * 根据情况更改.
 * 		2. tool.js的随机guid字符串函数guidString.
 * 该类主要用于各种css,html文档的演练, 以消除大量的为了比较一个属性, 往常而需要的大量重复代码.
 * 使用方法:
 * 		最简形式, 全部采用默认参数: new EffectSelector(); 即可
 * 说明: 
 * 		鼠标中键点击 selector, 即可重置
 * bug: 这个应该来自于select的change事件响应机制, 暂时无法解决
 * 	1) 选中option(s) -> 左键select空白, 结果: 撤销所有选择, target正常还原.
 * 	2) 选中option(s) -> select失去焦点 -> selct重获焦点 -> 左键select空白,结果: 撤销所有选择, target不能正常还原.
 *  经过反复研究, 在于重获焦点后的撤销选择, 不能引发change事件.所以目前最有效的方法是,
 *  设置已重置标志 _targetResetted, 具体操作是
 * 	左键事件中:
 * 			_targetResetted=false -> 撤销所有选项 -> 判断_targetResetted是否为false,是则执行target重置方法_resetTarget
 * 	并在_resetTarget方法末尾, 设置_targetResetted=true.
 *   	 
 *  
 */
class EffectSelector {

	/**
	 * 当前的目标元素集合
	 */
	private _targets: NodeListOf<HTMLElement>;

	/**
	 * 添加到目标元素, 用于记录目标元素的原始 title 的 javascript 属性名称
	 */
	private readonly ORIG_TITLE = "__orig__title";

	/**
	 * 内部的select元素, 用来记录当前选中元素需要测试的选项
	 */
	private _select: HTMLSelectElement;

	//private _targets: NodeListOf<HTMLElement>;

	/**
	 * 当前选中的目标元素, 主要用来切换到别的元素时, 恢复原来的目标元素
	 */
	private _target: HTMLElement | null = null;

	/**
	 * 代理目标元素mousedown处理, 保存的目的用于在dispose中顺利卸载
	 */
	private _proxyTargetMousedownHandler: (this: HTMLElement, evt: MouseEvent) => void;

	/**
	 * 代理目标右键上下文菜单处理, 保存的目的用于在dispose中顺利卸载
	 */
	private _proxyTargetContextmenuHandler: (this: HTMLElement, evt: MouseEvent) => void;


	private _targetResetted: boolean;
	/**
	 * 构造一个select, 用于提供测试选项
	 * @param dblclick2quit 是否配置双击退出, 默认为true
	 * @param flag 操作提示文本, 作为select的第一项, 不能选择, 
	 * 默认为 "right-mouse down to select"
	 * @param ways 目标元素中, 容纳以逗号隔开的, 由测试的各种"方式"组成的字符串的
	 * 属性名称.默认为 "ways"
	 * @param select_class select 的 class属性.默认为
	 * "form-select text-bg-dark position-fixed shadow-lg w-30 bottom-50 end-0"
	 * @param aria_label 是用不可视的方式给 select 元素添加 label
	 */
	public constructor(
		dblclick2quit: boolean = true,
		flag: string = "右键点击元素选中;左键点击select空白取消选中;中键点击select空白还原",
		ways: string = "ways",
		select_class: string = "form-select text-bg-light position-fixed shadow-lg w-30 bottom-50 end-0",
		aria_label: string = "select to change element facade"
	) {

		this._targetResetted = false;
		//#region 准备 select
		const opt = document.createElement("option");
		opt.disabled = true;
		opt.text = flag;

		this._select = document.createElement("select");
		this._select.setAttribute("class", select_class);
		this._select.setAttribute("id", guidString());
		this._select.setAttribute("aria-label", aria_label);
		this._select.multiple = true;
		this._select.size = 10;


		this._select.addEventListener("change", this._setTarget.bind(this));
		this._select.addEventListener("click", evt => {
			// 以防option点击响应
			if (evt.target == this._select) {
				if (evt.button == 0) {
					this._targetResetted = false;
					this._uncheckAllOptions();
					if (!this._targetResetted) {
						this._resetTarget();
					}

				} else if (evt.button == 1) {
					// 点击鼠标中键恢复当前目标元素,并清空select
					this._resetTarget();
					this._resetSelect();
					this._target = null;
				}
			}

		});
		if (dblclick2quit) {
			//双击select, 退出select, 考虑到dispose可能被客户端调用, 所以
			//不配置为一次性事件处理, 而是在dispose中统一卸载.
			this._select.addEventListener('dblclick', this.dispose.bind(this));
		}
		this._select.options.add(opt);
		document.body.append(this._select);
		//#endregion

		//#region 配置所有带 ways 属性的元素, 并保存
		this._proxyTargetMousedownHandler = this._refreshSelectOptions.bind(this);
		this._proxyTargetContextmenuHandler = this._disableContextmenu.bind(this);
		this._targets = document.querySelectorAll(`[${ways}]`) as NodeListOf<HTMLElement>;
		this._targets.forEach(tgt => {
			this._modifyAndBackupTitle(tgt);
			tgt.addEventListener("mousedown", this._proxyTargetMousedownHandler);
			tgt.addEventListener("contextmenu", this._proxyTargetContextmenuHandler);
		})
		//#endregion
	}

	/**
	 * 取消所有选项的选择
	 */
	private _uncheckAllOptions() {
		for (let i = 0; i < this._select.options.length; i++) {
			this._select.options[i].selected = false;
		}
	}
	/**
	 * 修改指定目标元素的title, 并备份到javascript属性 (ORIG_TITLE 指定)
	 * 为了在页面方便查看(潜在)目标元素, 所有带ways属性的元素, 均以自身的 ways 作为 title.
	 * @param target 待操作的目标元素
	 */
	private _modifyAndBackupTitle(target: HTMLElement) {
		const ways = target.getAttribute("ways");
		const title = `${target.tagName}:${ways}`;
		//@ts-ignore
		target[this.ORIG_TITLE] = target.getAttribute("title");
		target.setAttribute("title", title);
	}

	/**
	 * 目标元素右键处理:将关联的可用选项登记在select,
	 * @param evt 鼠标事件
	 */
	private _refreshSelectOptions(evt: MouseEvent) {
		const target = evt.currentTarget as HTMLElement;
		if (evt.button == 2 && this._target != target) {
			this._resetTarget();
			this._resetSelect();
			this._target = target;

			const ways = target.getAttribute("ways");
			if (ways) {
				ways.split(',').forEach(way => {
					const str = way.trim();
					if (str) {
						const opt = document.createElement("option");
						opt.text = str;
						this._select.options.add(opt);
					}
				})
			}
			// 停止冒泡, 阻止默认.
			//return false;
			evt.preventDefault();
			evt.stopPropagation();
		}
	}

	/**
	 * 目标元素右键上下文菜单的弹出处理: 禁用上下文菜单
	 * @param evt 鼠标事件
	 */
	private _disableContextmenu(evt: MouseEvent) {
		//	return false;已经不管用了
		evt.preventDefault();
		evt.stopPropagation();
	}



	/**
	 * 复位 select , 用于当 select 切换目标元素时,清空原来元素的关联选项
	 * 注意, 第一项不要移除
	 */
	private _resetSelect() {
		const len = this._select.length;
		for (let i = len - 1; i > 0; i--) {
			this._select.options[i].remove();
		}
	}

	/**
	 * 复位目标元素. 在 select 切换目标元素前, 以及 select 选中项目改变准备应用选项前使用, 以恢复
	 * 目标元素的原始状态
	 */
	private _resetTarget() {
		this._handleTarget(this._select.options, false);
		this._targetResetted = true;
	}

	/**
	 * 根据当前的选项, 处理当前的目标元素.
	 */
	private _setTarget() {
		this._resetTarget();
		this._handleTarget(this._select.selectedOptions, true);
	}

	// /**
	//  * 处理目标元素: 将指定的option集合与select连接或分离 
	//  * @param options 要连接或分离的options集合
	//  * @param attach 连接为true, 分离为false. 默认为true
	//  */
	// private _handleTarget(options: HTMLCollectionOf<HTMLOptionElement>, attach: boolean = true) {
	// 	if (this._target) {
	// 		const opts = options;
	// 		const len = opts.length;
	// 		let flag = '', kv = '', k = '', v = '';
	// 		let idx = -1;
	// 		for (let i = 0; i < len; i++) {
	// 			idx = opts[i].text.indexOf('-');

	// 			if (idx != -1) {
	// 				flag = opts[i].text.slice(0, idx);
	// 				kv = opts[i].text.slice(idx + 1);
	// 				idx = kv.indexOf('-');
	// 				if (idx != -1) {
	// 					k = kv.slice(0, idx);
	// 					v = kv.slice(idx + 1); // 如果误写为 h-pmt- 则idx+1超限,但不异常,只是返回''
	// 				} else {
	// 					k = kv;
	// 					v = '';
	// 				}
	// 				switch (flag) {
	// 					case 'h':
	// 						if (isNaN(Number(k))) { //html不能用数字作为属性名,否则报错
	// 							attach && this._target?.setAttribute(k, v),
	// 								!attach && this._target?.removeAttribute(k);
	// 						}
	// 						break;
	// 					case 'j':
	// 						//@ts-ignore
	// 						attach && (this._target[k] = v), !attach && (this._target[k] = undefined);
	// 						break;
	// 					case 'c':
	// 						//	不用检查是否包含, 因为重复添加会被自动忽略
	// 						attach && this._target?.classList.add(kv),
	// 							!attach && this._target?.classList.remove(kv);
	// 						break;
	// 					default:
	// 						break;
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	/**
 * 处理目标元素: 将指定的option集合与select连接或分离 
 * @param options 要连接或分离的options集合
 * @param attach 连接为true, 分离为false. 默认为true
 */
	private _handleTarget(options: HTMLCollectionOf<HTMLOptionElement>, attach: boolean = true) {
		if (this._target) {
			const opts = options;
			const len = opts.length;
			let text = '', flag = '', k = '', v = '';
			let idx = -1, left_brk = -1, right_brk = -1;
			for (let i = 0; i < len; i++) {
				// 规范形如 h(name)value, j(name)value, c(name)
				text = opts[i].text;
				left_brk = text.indexOf('(');
				right_brk = text.indexOf(')');
				flag = text.slice(0, left_brk);

				if (flag && left_brk != -1 && right_brk != -1) {
					k = text.slice(left_brk + 1, right_brk);
					v = text.slice(right_brk + 1);
					switch (flag.toLowerCase()) {
						case 'h':
							if (isNaN(Number(k))) { //html不能用数字作为属性名,否则报错
								attach && this._target?.setAttribute(k, v),
									!attach && this._target?.removeAttribute(k);
							}
							break;
						case 'j':
							//@ts-ignore
							attach && (this._target[k] = v), !attach && (this._target[k] = undefined);
							break;
						case 'c':
							//	不用检查是否包含, 因为重复添加会被自动忽略
							attach && this._target?.classList.add(k),
								!attach && this._target?.classList.remove(k);
							break;
						default:
							break;
					}
				}
			}
		}
	}

	/**
	 * 析构对象, 包括
	 * 1. 恢复当前元素的原始状态
	 * 2. 释放添加的操作
	 * 	1) title的还原: 使用新增的javascript属性(ORIG_TITLE指定)
	 * 	2) 卸载mousedown事件处理
	 * 	3) 卸载contextmenu事件处理
	 * 	4) 移除select, 从body中
	 * 注意, 构造函数中, 还有select的多个事件处理, 这里采用移除select后由垃圾回收处理
	 */
	public dispose() {
		console.log('dispose...');
		this._resetTarget();
		this._target = null;
		this._targets.forEach(tgt => {
			//@ts-ignore
			if (tgt[this.ORIG_TITLE]) {
				//@ts-ignore
				tgt.setAttribute('title', tgt[this.ORIG_TITLE]);
			} else {
				tgt.removeAttribute("title");
			}
			tgt.removeEventListener("mousedown", this._proxyTargetMousedownHandler);
			tgt.removeEventListener("contextmenu", this._proxyTargetContextmenuHandler);
		})
		this._select.remove();
	}
}

