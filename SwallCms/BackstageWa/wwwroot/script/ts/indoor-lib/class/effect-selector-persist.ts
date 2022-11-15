
/**
 * 目标元素选项处理器, 封装针对 html 属性, js 属性, css class 类, 在各种情况下的处理函数
 */
type TargetOptionProcessor = {
	/**
	 * 处理 html 属性的回调函数
	 */
	html_callback: (target: HTMLElement, key: string, value: string, opt: HTMLOptionElement) => void,
	/**
	 * 处理 js 属性的回调函数
	 */
	js_callback: (target: HTMLElement, key: string, value: string, opt: HTMLOptionElement) => void,
	/**
	 * 处理 css class 的回调函数
	 */
	class_callback: (target: HTMLElement, key: string, opt: HTMLOptionElement) => void,
}

/**
 * 使用动态生成的select, 并通过右键点击选择元素, 达到为该元素添加特征, 实时查看效果的目的.
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
 * 		与effect-selector的主要区别是, 后者没有记忆曾经的设置, 也就不能多个元素同时应用更改
 * 
 * 	为简化操作, 取消了左键点击空白撤销所有选项的操作(该操作可以使用 select 原生支持的 ctrl+鼠标左键逐项执行)
 * 	所以, _targetResetted 私有字段已经取消; 而左键点击空白, 执行的是撤销所有选中的 disabled . 因为只有撤销了它,
 *  再次右键点击选中才能成功
 *   	 
 *  事件说明:
 * 		1. 鼠标右键点击选中页面上需要调节形态的元素, 该元素必须具备 html 的 ways 属性, 
 * 	否则会弹出默认的右键上下文菜单, 而 select 无反应
 * 		2. select 实时显示当前元素的 ways 包含的可选条目, 并对应当前是否应用该 item.
 * 		3. 鼠标右键点击其他元素, 原来调整过的元素状态继续保留,
 * 		4. 鼠标左键点击 select 空白区域, 则释放所有元素选中的 disable (如果有). 因为不释放, 则无法再次
 * 	使用右键选定.
 * 		5. 鼠标左键双击 select 空白区域, 释放创建的资源, 对象退出
 * 		6. 禁用 ways 型元素的右键 context menu, 当元素被disabled时恢复, 而取消disabled时再次禁用
 *  注意:
 * 		取消选项: 按住 ctrl, 左键点击该 item . (这是原生select带有的特征)
 *  使用方法:
 * 			EffectSelectorPersist.getInstance();
 */
class EffectSelectorPersist {

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

	/**
	 * 当前选中的目标元素, 主要用来切换到别的元素时, 恢复原来的目标元素
	 */
	private _target: HTMLElement | null = null;

	/**
	 * 代理目标元素mousedown处理, 保存的目的用于在dispose中顺利卸载
	 */
	private _proxyTargetMousedownHandler: (this: HTMLElement, evt: MouseEvent) => void;

	/**
	 * singleton 
	 */
	private static _instance: EffectSelectorPersist;

	/**
	 * 目标元素中, 容纳以逗号隔开的, 由测试的各种"方式"组成的字符串的
	 * 属性名称.
	 */
	private _ways: string;

	/**
	 * 构造一个select, 用于提供测试选项
	 * @param dblclick2quit 是否配置双击退出
	 * @param prompt 操作提示文本, hover select 时的 title
	 * @param ways 目标元素中, 容纳以逗号隔开的, 由测试的各种"方式"组成的字符串的
	 * 属性名称.
	 * @param select_class select 的 class属性.
	 * @param aria_label 是用不可视的方式给 select 元素添加 label
	 */
	private constructor(
		dblclick2quit: boolean,
		prompt: string,
		ways: string,
		select_class: string,
		aria_label: string
	) {

		//#region 准备 select
		this._select = document.createElement("select");
		this._select.setAttribute("class", select_class);
		this._select.setAttribute("id", guidString());
		this._select.setAttribute("aria-label", aria_label);
		this._select.multiple = true;
		this._select.size = 10;
		this._select.tabIndex = 100000;
		this._select.title = prompt;
		document.body.append(this._select);

		this._ways = ways;

		this._select.addEventListener("change", this._setCurrentTarget.bind(this));
		this._select.addEventListener("mousedown", evt => {
			if (evt.target == this._select) { // 冒泡来的点击不理
				if (evt.button == 0) {
					//左键空白去掉disable, 如果有, 而且是对象添加的.
					this._targets.forEach(tgt => {
						if (tgt.getAttribute(`${ways}`)?.includes("h(disabled)") &&
							(tgt.getAttribute("disabled") != null)) {
							tgt.removeAttribute('disabled');
							if (this._target == tgt) {
								const opts = this._select.options
								for (let i = 0; i < opts.length; i++) {
									if (opts[i].value == "h(disabled)") {
										opts[i].selected = false;
										break;
									}
								}
							}
						}
					});
				}
			}
		});
		//双击select, 退出select, 考虑到dispose可能被客户端调用, 所以
		//不配置为一次性事件处理, 而是在dispose中统一卸载.
		dblclick2quit && this._select.addEventListener('dblclick', this.dispose.bind(this));
		//#endregion

		//#region 配置所有带 ways 属性的元素, 并保存
		this._proxyTargetMousedownHandler = this._updateSelect.bind(this);
		this._targets = document.querySelectorAll(`[${ways}]`) as NodeListOf<HTMLElement>;
		this._targets.forEach(tgt => {
			this._modifyAndBackupTitle(tgt);
			tgt.addEventListener("mousedown", this._proxyTargetMousedownHandler);
			tgt.addEventListener("contextmenu", this._preventAndStop);
		})
		//#endregion
	}

	/**
	 * 获取唯一实例
	 * @param dblclick2quit 是否配置双击退出, 默认为true
	 * @param prompt 操作提示文本, 作为 select hover 时的title, 
	 * 默认为 "right-mouse down to select"
	 * @param ways 目标元素中, 容纳以逗号隔开的, 由测试的各种"方式"组成的字符串的
	 * 属性名称.默认为 "ways"
	 * @param select_class select 的 class属性.默认为
	 * "form-select text-bg-dark position-fixed shadow-lg w-30 bottom-50 end-0"
	 * @param aria_label 是用不可视的方式给 select 元素添加 label
	 * @returns EffectSelectorPersist 唯一实例, 正因如此, 后续获取, 参数均被忽略 
	 */
	public static getInstance(dblclick2quit: boolean = true,
		prompt: string = "页面元素:右键选中;select:左键空白取消所有disabled,双击退出",
		ways: string = "ways",
		select_class: string = "form-select text-bg-dark position-fixed shadow-lg w-30 bottom-50 end-0",
		aria_label: string = "select to change element facade") {
		if (!EffectSelectorPersist._instance) {
			EffectSelectorPersist._instance = new EffectSelectorPersist(dblclick2quit, prompt, ways, select_class, aria_label);
		}
		return EffectSelectorPersist._instance;
	}

	/**
	 * 修改指定目标元素的title, 并备份到javascript属性 (ORIG_TITLE 指定)
	 * 为了在页面方便查看(潜在)目标元素, 所有带ways属性的元素, 均以自身的 ways 作为 title.
	 * @param target 待操作的目标元素
	 */
	private _modifyAndBackupTitle(target: HTMLElement) {
		const ways_str = target.getAttribute(`${this._ways}`);
		const title = `${target.tagName}:${ways_str}`;
		//@ts-ignore
		target[this.ORIG_TITLE] = target.getAttribute("title");
		target.setAttribute("title", title);
	}

	/**
	 * 目标元素右键处理, 更新 select 面板内容: 将关联的可用选项登记在select,同时根据元素的状态, 与select
	 * 的选项做好对应关系(选择还是不选择)
	 * @param evt 鼠标事件
	 */
	private _updateSelect(evt: MouseEvent) {
		// 未判断 evt.target == evt.currentTarget, 是为了允许无ways的子元素被点击后,
		// 冒泡到父元素. 否则有时候, 一些容器元素, 可能无法通过鼠标选择.
		// 而父元素处理后, 也是立即停止冒泡
		// 所以, 如果上下级(或中间空了一级, 它没有ways)均有ways, 则右键点击, 会在上下级之间切换.
		// 整好满足需要. 但如果上级上面还有带 ways 的顶级, 点下级则无法到达此顶级.
		const target = evt.currentTarget as HTMLElement;
		// 连续的重复点击则忽略
		if (evt.button == 2 && this._target != target) {
			this._resetSelect();
			this._waysToOptionsArray(target).forEach(opt => {
				this._select.options.add(opt);
			})
			this._target = target;
			//	console.log(this._target);
			// 停止继续冒泡, 阻止默认.
			//return false;
			this._preventAndStop(evt);
		}
	}


	/**
	 * 目标 html 元素的 ways 属性(如果有)值, 转换为 HTMLOptionElement 数组
	 * @param target 目标 html 元素
	 * @returns HTMLOptionElement 数组
	 */
	private _waysToOptionsArray(target: HTMLElement) {
		const ps = this._getInitializingTOP();
		const options: Array<HTMLOptionElement> = [];
		const ways_str = target.getAttribute(`${this._ways}`) || "";
		ways_str.split(',').sort().forEach(way => {
			way = way.trim();
			if (way) {
				const opt = document.createElement("option");
				opt.value = way;
				this.__processTargetOption(ps, target, opt);
				options.push(opt);
			}
		});
		return options;
	}

	/**
	 * 目标元素右键上下文菜单的弹出处理: 禁用上下文菜单
	 * @param evt 鼠标事件
	 */
	private _preventAndStop(evt: MouseEvent) {
		evt.preventDefault();
		evt.stopPropagation();
		// 右键上下文菜单的弹出, 无法使用一般讲与上等效的return false禁止
		//return false;
	}

	/**
	 * 复位 select , 用于当 select 切换目标元素时,清空原来元素的关联选项
	 */
	private _resetSelect() {
		const len = this._select.length;
		for (let i = len - 1; i >= 0; i--) {
			this._select.options[i].remove();
		}
	}

	/**
	 * 根据当前的选项, 处理当前的目标元素.
	 */
	private _setCurrentTarget() {
		if (this._target) {
			this._setTarget(this._target);
		}
	}


	/**
 * 处理目标元素: 按照 select 各选项的状态, 设置当前目标元素各个属性(html js class)和值
 * @param target 目标元素
 */
	private _setTarget(target: HTMLElement) {
		const processor = this._getSettingTOP();

		const opts = this._select.options;
		const len = opts.length;
		for (let i = 0; i < len; i++) {
			// 规范形如 h(name)value, j(name)value, c(name)
			const opt = opts[i];
			this.__processTargetOption(processor, target, opt);
		}
	}

	/**
	 * 获取目标元素选项处理器, 该处理器用于初始化目标元素与select选项, 并使其对应起来
	 * @returns 
	 */
	private _getInitializingTOP() {
		return {
			html_callback: (target, key, value, opt) => {
				opt.text = `${target.tagName}---html....${key}`;
				if (value) {
					// 有值才出现等号, 即使空字符串也不用
					opt.text = `${opt.text} = ${value}`;
				}
				if (key == "style") {
					const curr = target.getAttribute(key) || "";
					opt.selected = curr.indexOf(value) != -1;
				} else {
					//	console.log(`html  key:${key},getAttr:${target.getAttribute(key)},value:${value}`);
					opt.selected = target.getAttribute(key) == value;
				}

			},
			js_callback: (target, key, value, opt) => {
				// 注意, 很多 js 属性即使使用 "false" 赋值, 该属性也被激活, 例如 indeterminate
				// 但是 空字符串则不行
				opt.text = `${target.tagName}---js........${key}`;
				if (value) {
					opt.text = `${opt.text} = ${value}`;
				}

				//@ts-ignore
				//console.log(`js  key:${key},getProp:${target[key]},value:${value}`);
				//@ts-ignore
				//opt.selected = target[key] == value;
				if (target[key]) {
					opt.selected = true;
				} else {		// 包含很多: "" null undefined false
					opt.selected = false;
				}
			},
			class_callback: (target, key, opt) => {
				//	不用检查是否包含, 因为重复添加会被自动忽略
				opt.text = `${target.tagName}---class...${key}`;
				opt.selected = target.classList.contains(key);
			}
		} as TargetOptionProcessor;
	}

	/**
	 * 获取目标元素选项处理器, 该处理器用于重置元素
	 * @returns 
	 */
	private _getResettingTOP() {
		return {
			// 省略后续两个参数, 下同
			html_callback: (target, key) => {
				target.removeAttribute(key);
			},
			js_callback: (target, key) => {
				//@ts-ignore
				target[key] = undefined;
			},
			class_callback: (target, key) => {
				target.classList.remove(key);
			}
		} as TargetOptionProcessor;
	}

	/**
	 * 获取目标元素选项处理器, 该处理器用于设置元素
	 * @returns 
	 */
	private _getSettingTOP() {
		return {
			html_callback: (target, key, value, opt) => {
				if (key == "style") {
					const old = target.getAttribute(key) || "";
					if (opt.selected && old.indexOf(value) == -1) {
						target.setAttribute("style", `${old}${value}`);

					} else if (!opt.selected && old.indexOf(value) != -1) {
						target.setAttribute("style", old.replace(value, ""));
					}
				} else {
					if (opt.selected) {
						target.setAttribute(key, value);
					}
					else if (target.getAttribute(key) == value) {
						// 本质上不能直接移除, 如果是给同一个html attr 切换多个值, 移除则先前的赋值失效
						// 只有当未选中, 同时该项属性值等于当前 value 才可移除				
						target.removeAttribute(key);
					}
				}

			},
			js_callback: (target, key, value, opt) => {
				if (opt.selected) {
					//@ts-ignore
					target[key] = value;
					//	console.log(`setting js, key=${key}, value=${value} `);
				} else {
					//@ts-ignore
					target[key] = undefined;
				}
			},
			class_callback: (target, key, opt) => {
				if (opt.selected) {
					//	不用检查是否包含, 因为重复添加会被自动忽略
					// 但是重复添加, 会引发相应的 mutation, 这对 obser-wrapper 的工作会有负面影响
					if (!target.classList.contains(key)) {
						target.classList.add(key);
					}
				} else {
					if (target.classList.contains(key)) {
						target.classList.remove(key);
					}

				}
			}
		} as TargetOptionProcessor;
	}

	/**
	 * 处理器对应于不同情况下的处理函数通用模板
	 * @param processor 处理器
	 * @param target 目标元素
	 * @param opt 代表其值(value)用来处理目标元素的选项
	 * 注意: 实际处理时用到的 k/v, 虽然由 opt 计算得到, 但中间经过太多步骤, 各处理函数无法直接使用
	 * opt 作为参数, 故在此模板函数的各处理函数的参数列表中, 同时出现 k/v 和 opt.
	 */
	private __processTargetOption(processor: TargetOptionProcessor, target: HTMLElement, opt: HTMLOptionElement) {
		const str = opt.value;
		const left_brk = str.indexOf('(');
		const right_brk = str.indexOf(')');
		const flag = str.slice(0, left_brk);

		if (flag && left_brk != -1 && right_brk != -1) {
			const k = str.slice(left_brk + 1, right_brk);
			const v = str.slice(right_brk + 1);
			switch (flag.toLowerCase()) {
				case 'h':
					if (isNaN(Number(k))) { //html不能用数字作为属性名,否则报错
						processor.html_callback(target, k, v, opt);
					}
					break;
				case 'j':
					processor.js_callback(target, k, v, opt);
					break;
				case 'c':
					processor.class_callback(target, k, opt);
					break;
				default:
					break;
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
		const ps = this._getResettingTOP();
		this._targets.forEach(tgt => {

			this._waysToOptionsArray(tgt).forEach(opt => {
				this.__processTargetOption(ps, tgt, opt);
			});

			//@ts-ignore
			if (tgt[this.ORIG_TITLE]) {
				//@ts-ignore
				tgt.setAttribute('title', tgt[this.ORIG_TITLE]);
			} else {
				tgt.removeAttribute("title");
			}
			tgt.removeEventListener("mousedown", this._proxyTargetMousedownHandler);
			tgt.removeEventListener("contextmenu", this._preventAndStop);
		})
		this._select.remove();
	}
}
// EffectSelectorPersist.getInstance();
