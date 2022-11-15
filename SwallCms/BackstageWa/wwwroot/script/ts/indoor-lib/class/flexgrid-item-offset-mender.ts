


/**
 * 利用 ObserverWrapper 对象观察包装器, 实现实时监视页面的所有静态, 动态(包括动态增删元素,
 * 动态改变style class)的 flex 风格的, 使用了 offset- 产生列偏移的 column.
 * 动机: 
 * 		1. bootstrap 的 flex 风格的 grid, 列偏移 css 类: .offset, 采用的是相对于包含块
 * 	的宽度的百分比值, 不论水平或垂直 margin 均如此 .
 * 	https://developer.mozilla.org/zh-CN/docs/Web/CSS/margin
 * 		2. 使用 js 在必要的时候, 修改各种 offset- 类代表的偏移为正确偏移值. 必须利用
 *  MutationObserver. 这里利用了封装过的 ObserverWrapper, 通过它们的简单交互, 即可达到目的.
 * 依赖:
 * 		1. fixFlexGridColMargin function at tool.ts. 
 * 		2. ObserverWrapper class at observer-wrapper.ts
 * 		3. 2 依赖的 LiveSet class at live-set.ts
 * 原理:
 * 		1. 监听观察器的 node added 事件, 一旦发现有元素的加入,
 * 			1) 尝试添加到 set 列表, 不合格的和已经存在的自然被忽略;
 * 			2) 添加成功立即监视它;
 * 			3) 添加成功后, 尝试修正该元素. 
 * 		2. 观察器一旦发现有元素 attribute 变化, 也执行 1 的操作. 但是为了为了避免死循环,
 *  需要过滤 class / style, 特别是 style 只能是 width/height 变化, 而且是针对 row. 因为,
 *  col 修正的值是 margin, 且修正的触发点是 row 的 class/style 以及 col 自身的 class变化
 *   	3. 观察器发现自己监听的 row/col 分别有 class/style 和 class 的
 * 	变化, 启动检验逻辑, 决定是否修正该元素
 * 		4. 对于一些嵌套的 flex 网格, col 也是 row, 上述已经做好了应对.  
 * 关于列选择:
 * 		1. 最初的设计, 采用判别 offset- 的方法, 但是这样一来, 如果动态取消所有
 *  offset-, col 的margin就没有相应设置, 因为它已经被误认为不是合格的 col. 所以
 *  后来将 col 的判别, 简单使用其父级是 row 的方法, 还来的直接和精准. 
 * 		2. 同时初始元素列表的选择符, 只采用选择 row 的形式, 即初始列表只有 row.
 * 	初始时只由它启动来修复其下级的 col; 至于 col, 在 offset- 等属性改变时, 通过
 * 	attributeChanged 事件响应, 自动添加到列表, 并实施关注, 已做到 "尽量少做修复"
 * 	的目的.
 * 
 * 	使用方法:	
 * 			FlexgridItemOffsetMender.instance.start();
 */
class FlexgridItemOffsetMender {
	private static _instance = new FlexgridItemOffsetMender();
	public static get instance() {
		return this._instance;
	}
	// 根观察包装器, 这里如果不选择 body, 则只关注的 flex 元素的动态范围将缩小
	private readonly ROOT_SEL = 'body';
	private _rootObsWrp: ObserverWrapper;

	// row 相关 class 和 选择符
	private readonly ROW = "row";
	private readonly ROWR = "rowr";
	private readonly VROW = "vrow";
	private readonly VROWR = "vrowr";
	private readonly ROW_SEL = `.${this.ROW},.${this.ROWR},.${this.VROW},.${this.VROWR}`;


	// 简单起见, 没有列出 .offset 必须跟随的 .col- 系列类
	// 当需要修正 margin 时, 在 fixFlexGridColMargin 子程序 中还有检查
	//private readonly OFFSET = "offset-";
	//private readonly OFFSET_SEL = `[class*=${this.OFFSET}]`;

	private readonly _flexEles: LiveSet<HTMLElement>;
	/**
	 * 初始化观察包装器及列表
	 */
	private constructor() {
		this._rootObsWrp = new ObserverWrapper(this.ROOT_SEL);
		this._rootObsWrp.observerOptions.attributeFilter = ["class", "style"];
		//this._flexEles = new LiveSet(Array.from(document.querySelectorAll(`${this.ROW_SEL},${this.OFFSET_SEL}`)));
		this._flexEles = new LiveSet(Array.from(document.querySelectorAll(this.ROW_SEL)));
	}

	/**
	 * 开始观察, 并通过事件监听, 实施必要的修正
	 * 经过反复调试, 已经核实, 目前无任何一次多余的重复修正, 即最精简的修正模式.
	 */
	public start() {
		// 1. 新增的元素可能是 row 和(或) offset- 形式的 col(以下简称col)
		// 2. class 属性变化可能引起 row 或(和) col 的形成(已设置过滤, 属性必是class/style)
		this._rootObsWrp.onNodeAdded(evt => {
			this._try_add_observe_correct(evt.addedChild); // 添加到其父级的节点: evt.addedChild
		}).onAttributeChanged(evt => {

			// 注意: 设置的属性, 有可能与原来的相等. 这时候, 仍然会引发 attributeChanged
			// 见 observer-wrapper.ts 的测试部分
			// 所以需要判断, 精简处理
			if (evt.oldValue != evt.newValue) {
				// 已过滤为 class / style
				const oldV = evt.oldValue || '';
				const newV = evt.newValue || '';
				const ele = evt.element; // 属性变化的节点: evt.element

				const p_newly = "attr->newly";
				const p_recome = "attr->recome";
				if (this._isCol(evt.element) && evt.attrName == "class") {
					// 只有 class 会使 offset 变化, 而且因为修正的是style的margin,
					// 如果响应 style, 必然会死循环
					const prompt = this._tryToAddThenObserve(ele) ?
						`[col] ${p_newly}` : `[col] ${p_recome}`;
					this._tryCorrectAsCol(ele, prompt);
				}

				if (this._isRow(evt.element) &&
					(evt.attrName == "class" ||
						oldV.indexOf('width') != -1 || oldV.indexOf('height') != -1 ||
						newV.indexOf('width') != -1 || newV.indexOf('height') != -1
					)) {
					const prompt = this._tryToAddThenObserve(ele) ?
						`[row] ${p_newly}` : `[row] ${p_recome}`;
					this._tryCorrectAsRow(ele, prompt);
				}
			}

		}).start();

		// 后续添加的观察目标, 不包含新增元素的后代节点
		this._rootObsWrp.observerOptions.subtree = false;

		// 原始状态下, 可能就有需要修补的 row/col, (row 其实就是修补它下级的 col)
		// 然后逐一作为观察目标, 使用不包含后代节点的方式
		this._flexEles.innerSet.forEach(ele => {
			this._rootObsWrp.observeNode(ele);
			this._tryCorrect(ele, 'init');
		});
	}

	/**
	 * 停止所有观察
	 */
	public stop() {
		this._rootObsWrp.stop();
	}

	/**
	 * 尝试将元素: 添加到列表; 关注; 修复
	 * @param ele 指定要添加的元素
	 */
	private _try_add_observe_correct(ele: HTMLElement) {
		const prompt = this._tryToAddThenObserve(ele) ? "newly" : "recome";
		this._tryCorrect(ele, prompt);
	}

	/**
	 * 尝试将指定元素作为新元素添加到列表并关注. 
	 * @param ele 指定元素
	 * @returns 成功返回 true, 失败返回 false(该元素已经在列表中并被关注)
	 */
	private _tryToAddThenObserve(ele: HTMLElement) {
		let ok = false;
		// 如果使用flexEles内部事件机制, 可能会让代码变得更复杂
		if ((this._isCol(ele) || this._isRow(ele)) &&
			this._flexEles.add(ele) == true) {
			this._rootObsWrp.observeNode(ele);
			ok = true;
		}
		return ok;
	}

	/**
	 * 尝试将元素依次当做 col 和 row 修复
	 * @param ele 指定要修复的元素
	 * @param prompt 如果成功, 则修复前将打印的相关部分提示文本
	 * @returns 至少成功修复一次, 返回 true, 否则返回 false
	 * @remark 对于嵌套网格, col 可能同时就是 row, 然后就会经历
	 * 两次修复, 一次是自身, 一次是它的子级
	 */
	private _tryCorrect(ele: HTMLElement, prompt: string) {
		let ok = false;
		ok = this._tryCorrectAsCol(ele, prompt);
		ok = this._tryCorrectAsRow(ele, prompt);
		return ok;
	}

	/**
 * 尝试将元素以作为 row 修复其子级, 所有带有 offset 的 col
 * @param ele 指定元素
 * @param prompt 如果是, 则修复前将打印的相关部分提示文本
 * @return 该 row 的子级中, 修复完成(发生修复操作)至少一次返回 true; 无子级需修复
 * 	返回 false
 */
	private _tryCorrectAsRow(ele: HTMLElement, prompt: string) {
		let count = 0;
		if (this._isRow(ele)) {
			console.warn(`fix row ${ele.tagName}:<${ele.className}>,details: ${prompt}`);
			Array.from(ele.children).forEach(son => {
				const col = son as HTMLElement;
				if (this._tryCorrectAsCol(col, `by row ${ele.tagName}`)) {
					count++;
				}
			});
		}
		return count > 0;
	}

	/**
	 * 尝试将元素以作为 col 修复其 offset 引起的margin
	 * @param ele 指定元素
	 * @param prompt 如果是, 则修复前将打印的相关部分提示文本
	 * @return 修正完成(不一定有变化)返回true, 无需修正(例如元素不合格)返回false
	 */
	private _tryCorrectAsCol(ele: HTMLElement, prompt: string) {
		let ok = false;
		if (this._isCol(ele)) {
			const str = `		fix col : ${ele.tagName}:<${ele.className}>,details: ${prompt},result: `;
			let result = 'no neccessary';
			if (ok = fixFlexGridColMargin(ele)) {
				const margin = getComputedStyle(ele, null).margin;
				result = `margin:<${margin}>`;
			}
			console.log(`${str}${result}`);
		}
		return ok;
	}

	/**
 * 判断元素是否属于flex布局的 row
 * @param ele 要判断的元素
 * @returns 属于 flex 返回 true, 否则返回 false.
 */
	private _isRow(ele: HTMLElement) {
		const clsList = ele.classList;
		return clsList?.contains(this.ROW) || clsList?.contains(this.ROWR) ||
			clsList?.contains(this.VROW) || clsList?.contains(this.VROWR);
	}

	/**
	 * 判断元素是否属于flex布局的 offset col
	 * @param ele 要判断的元素
	 * @returns 属于 flex 返回 true, 否则返回 false.
	 * @remark 注意, 当切换成不包含 offset- 时, 需要根据上级是否为 row 来判断它,
	 *  以便将所有 margin 置零.
	 */
	private _isCol(ele: HTMLElement) {
		const par = ele.parentElement;
		//return ele.className.indexOf(this.OFFSET) != -1 || (par && this._isRow(par));
		return par && this._isRow(par);
	}
}
// FlexgridItemOffsetMender.instance.start();