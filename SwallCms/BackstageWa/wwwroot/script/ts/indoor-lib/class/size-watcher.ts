/**
 * 用来描述Html元素在整个文档窗口中的区域数据
 */
type ElementArea = {
	/**
	 * 距离文档左边界的距离,单位px
	 */
	leftFromBody: number,
	/**
	 * 距离文档上边界的距离,单位px
	 */
	topFromBody: number,
	/**
	 * 元素的外部宽度,不包括margin
	 */
	offsetWidth: number;
	/**
	 * 元素的外部高度,不包括mrgin
	 */
	offsetHeight: number;
}
/**
 * 获取指定元素的ElementArea数据
 * @param ele 指定元素
 * @returns ElementArea数据
 */
function areaFromBody(ele: HTMLElement): ElementArea {
	let left = 0;
	let top = 0;
	let e: HTMLElement = ele;
	const w = e.offsetWidth;
	const h = e.offsetHeight;
	while (e && e.tagName != "BODY") {
		left += e.offsetLeft;
		top += e.offsetTop;
		e = e.offsetParent as HTMLElement;
	}
	return {
		leftFromBody: left,
		topFromBody: top,
		offsetWidth: w,
		offsetHeight: h,
	} as ElementArea;
}

/**
 * 信息板,用于记录指定元素当前和原始的宽度/高度信息
 */
class InfoBoard {
	/**
	 * 要在此信息板显示该目标元素的信息
	 */
	public readonly target: HTMLElement;
	/**
	 * 一个绝对定位的元素,所有该类元素最终被构造函数提供的wrapper元素包裹,
	 * 信息将通过此元素展示
	 */
	private readonly _entity: HTMLDivElement;
	/**
	 * 记录目标元素的相关原始数据
	 */
	private readonly _origArea: ElementArea;
	/**
	 * 以此决定,需要在信息板上显示的信息,
	 * 包含'w'字符,则显示宽度;
	 * 包含'h'字符,则显示高度.
	 */
	private readonly _desc: string;

	/**
	 * 构造一个信息板,用于记录指定元素当前和原始的宽度/高度信息
	 * @param target 要记录信息的元素
	 * @param wrapper 用以包裹展示元素
	 * @param desc 描述该信息板需要展示的数据种类.
	 * 				包含'w'字符,则显示宽度;
	 * 				包含'h'字符,则显示高度.
	 */
	public constructor(target: HTMLElement, wrapper: HTMLElement, desc: string) {
		this.target = target;
		this._entity = document.createElement('div');
		this._origArea = areaFromBody(this.target);
		this._desc = desc;

		wrapper.append(this._entity);
		Object.assign(this._entity.style, {
			position: "absolute",
			backgroundColor: "#000",
			color: "#fff",
			fontSize: "0.8em",
			lineHeight: "1.1",
			textAlign: "center",
			letterSpacing: "0.8px",
			opacity: '1.0',
		});

		this.target.addEventListener('mouseenter', (evt: MouseEvent) => {
			if (evt.target != document.body) {
				this._entity.style.opacity = '0.2';
			}

		});
		this.target.addEventListener('mouseleave', (evt: MouseEvent) => {
			if (evt.target != document.body) {
				this._entity.style.opacity = '1';
			}

		});
		//纯粹依靠window的resize事件, , 初始化需要自己调用一次
		//this.refresh();
	}
	/**
	 * 刷新信息板内容
	 */
	public refresh() {
		const area = areaFromBody(this.target);
		//console.log(area);
		Object.assign(this._entity.style, {
			left: area.leftFromBody + "px",
			top: area.topFromBody + "px",
		});

		this._entity.innerHTML = '';
		['w', 'h'].forEach(flag => {
			if (this._desc.indexOf(flag) != -1) {
				this._entity.innerHTML += this._htmlInfo(this._origArea, area, flag as 'w' | 'h');
			}
		})
	}
	/**
	 * 获取格式化好的包含指定数据的html文本
	 * @param orig_area 原始相关数据
	 * @param curr_area 当前相关数据
	 * @param desc 指定要显示的数据
	 * 				包含'w'字符,则显示宽度;
	 * 				包含'h'字符,则显示高度.
	 * @returns 格式化好的包含指定数据的html文本
	 */
	private _htmlInfo(orig_area: ElementArea, curr_area: ElementArea, desc: 'w' | 'h'): string {
		const orig = Math.floor(desc == 'w' ? orig_area.offsetWidth : orig_area.offsetHeight);
		const curr = Math.floor(desc == 'w' ? curr_area.offsetWidth : curr_area.offsetHeight);
		const percent = Math.floor(curr * 100 / orig);
		return `<p>${desc}:${percent}%</p><p>${curr}/${orig}</p>`;
	}
}

/**
 * 尺寸观察者,一般用以在flex/grid等布局测试时,实时展示元素的相关宽度/高度信息
 */
class SizeWatcher {
	/**
	 * 容器列表,这些容器中的每个子元素,将作为被观察的对象
	 */
	private _containers: NodeListOf<HTMLElement>;
	/**
	 * 用来展示信息的各个信息板,将被此元素包括
	 */
	private _wrapper: HTMLDivElement;
	/**
	 * 以各个被观察的元素对应的信息板为元素,组成的列表
	 */
	private _ibs: Array<InfoBoard>;

	/**
	 * 尺寸观察器
	 */
	private _rizeObserver: ResizeObserver;
	/**
	 * 构造一个尺寸观察者
	 * @param containerSelectors 选择器字串,多个用逗号隔开,这些选择器的所有子元素将被实时观察
	 * @param desc 表达需要观察的信息种类:宽度还是高度
	 * 				包含'w'字符,则显示宽度;
	 * 				包含'h'字符,则显示高度.
	 * @remark 暂时无法用于svg及其子元素
	 */
	public constructor(containerSelectors: string, desc: string = 'w') {
		this._wrapper = document.createElement('div');
		document.body.append(this._wrapper);
		this._containers = document.querySelectorAll<HTMLElement>(containerSelectors);
		this._ibs = [];

		//尺寸变化时刷新.因为window的resize已经完成refresh.所
		this._rizeObserver = new ResizeObserver(entries => {
			// entries.forEach(v => {
			// 	const tgt = this._ibs.find(ib => ib.target === v.target);
			// 	if (tgt != null) {
			// 		tgt.refresh();
			// 	}
			// })
			//其一发生尺寸变化,可能会导致其他元素移动,所以应该全部刷新
			this._ibs.forEach(ib => {
				ib.refresh();
			})
		})

		this._containers.forEach(container => {
			const eles = container.children;
			console.log('length:', eles.length);
			for (let i = 0; i < eles.length; i++) {
				const e = eles.item(i) as HTMLElement;
				if (null != e) {
					this._rizeObserver.observe(e);
					this._ibs.push(new InfoBoard(e, this._wrapper, desc));
				}
			}
		});
		this._ibs.push(new InfoBoard(document.body, this._wrapper, desc));

		//window尺寸变化, 可能会引起元素尺寸或/和位置变化.
		//以后有时间,考虑采用MutationObserver替代.
		window.addEventListener('resize', (evt: Event) => {
			this._ibs.forEach(ib => {
				ib.refresh();
			})
		});


	}
}