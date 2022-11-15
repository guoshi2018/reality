

type BsObjectOption = {
    toggle_flag: string,
    type_name: string;
    attrs: Array<string>;
}

/**
 * 动态 Bootstrap 对象(例如 Popover) 对象管理器, 适用于触发者和组件为一体的, 同时又需要手工初始化的组件
 * 动机: 一些 Bootstarp 对象(例如 popover)的使用, 需要初始化, 一般在 js 脚本的 window.onload 中, 通过针对每个 toggle:* 的元素生成对应的 bootstrap 对象进行. 但是, 对于在页面加载完成后, 通过程序设定产生的具备 toggle:* 的元素, 则无法自动生成对应的对象. 该类型的目的即在于此: 监视页面元素的添加/属性改变, 凡是符合条件的元素, 立即生成新的对象, 如果该元素以前已经生成过对象, 此次仅仅是一些参数上发生变化, 则生成新的 对象后, 原来的将被 gc 回收.
 * 目前包含 popover, scrollspy, tooltip 
 * 注意: 官网文档并未说明, scroll spy 的实现, 也需要像 popover 一样, 初始化后方可使用. 同时, bootstrap 原版定义的 ScrollSpy 类, 并不需要 data-bs-toggle 属性做标记(因为已经带有独一无二的 data-bs-spy). 为了 dynamic-bootstrap-object-manager 对所有类似对象的统一动态生成, 特设置 data-bs-toggle="scrollspy".
 * 对于触发者和目标组件分离的情况, 请使用 dynamic-bootstrap-objcet-toggler-manager
 * 
 * 使用方法: 
 * 			DynamicBootstrapObjectManager.instance.start();
 * 			
 */
class DynamicBootstrapObjectManager {

    private static _instance = new DynamicBootstrapObjectManager();
    public static get instance() {
        return this._instance;
    }

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
     * 用来容纳属性 toggle 有所指 element 对应的 bootstrap 对象的外壳对象
     */
    private readonly _objHull;
    // 根观察包装器
    private readonly ROOT_SEL = 'body';
    private _rootObsWrp: ObserverWrapper;

    private readonly ATTR_FILTERS = [
        this.BS_TOGGLER,
        this.BS_TARGET,
        this.H_HREF,
    ];

    // 这里值列出常用的 attr , 特殊情况下的 attr 还需要查看官方文档后添加
    private readonly _bsObjOptions: Array<BsObjectOption> = [
        {
            toggle_flag: "popover",
            type_name: "Popover",
            attrs: ["data-bs-title", "data-bs-container", "data-bs-custom-class",
                "data-bs-trigger", "data-bs-content", "data-bs-placement"],
        }, {
            toggle_flag: "scrollspy",
            type_name: "ScrollSpy",
            attrs: ["data-bs-spy", "data-bs-root-margin", "data-bs-smooth-scroll"]
        },
        {
            toggle_flag: "tooltip",
            type_name: "Tooltip",
            attrs: ["data-bs-title", "data-bs-custom-class", "data-bs-placement", "data-bs-html"],
        }
    ];

    /**
     * 初始化观察包装器及列表
     */
    private constructor() {
        this._rootObsWrp = new ObserverWrapper(this.ROOT_SEL);

        const filter = [...this.ATTR_FILTERS];

        this._bsObjOptions.forEach(opt => {
            //	filter.push(opt.name.toLowerCase());
            filter.push(...opt.attrs);
        });
        this._rootObsWrp.observerOptions.attributeFilter = filter;
        this._objHull = {};
    }

    /**
     * 开始观察, 并通过事件监听, 实施必要的修正
     * 经过反复调试, 已经核实, 目前无任何一次多余的重复修正, 即最精简的修正模式.
     */
    public start() {
        this._rootObsWrp.onNodeAdded(evt => {
            this._tryBsObject(evt.element);
        }).onAttributeChanged(evt => {

            // 注意: 设置的属性, 有可能与原来的相等. 这时候, 仍然会引发 attributeChanged
            // 见 observer-wrapper.ts 的测试部分
            // 所以需要判断, 精简处理
            if (evt.oldValue != evt.newValue) {
                this._tryBsObject(evt.element);
            }

        }).start();

        // 初始化现存的 bootstrap 对象
        let selector = "";
        this._bsObjOptions.forEach(opt => {
            selector += `[${this.BS_TOGGLER}=${opt.toggle_flag}],`;
        });
        selector = selector.slice(0, -1);
        document.querySelectorAll(selector).forEach(ele => {
            this._saveInstance(ele);
        });
    }

    /**
     * 停止所有观察
     */
    public stop() {
        this._rootObsWrp.stop();
    }

    private _tryBsObject(ele: Element) {
        this._deleteObject(ele);
        this._saveInstance(ele);
    }

    private _deleteObject(ele: Element) {
        if (!ele.id) {
            ele.id = guidString();
        }
        //@ts-ignore
        if (this._objHull[ele.id]) {
            //@ts-ignore
            this._objHull[ele.id].dispose();
            //@ts-ignore
            this._objHull[ele.id] = null;
            //		console.log('dispose obj...');
        }
    }


    private _saveInstance(ele: Element) {

        if (!ele.id) {
            ele.id = guidString();
        }
        const constructor_name = this._findTypeName(ele).trim();
        if (constructor_name.length > 0) {
            //@ts-ignore
            //this._objHull[ele.id] = new bootstrap[constructor_name](ele);
            this._objHull[ele.id] = bootstrap[constructor_name].getOrCreateInstance(ele);
            //		console.log('create obj...');
        }
    }

    private _findTypeName(ele: Element) {
        const flag = ele.getAttribute(this.BS_TOGGLER);
        const opt = this._bsObjOptions.find(v => v.toggle_flag == flag);
        return opt ? opt.type_name : "";
    }
}
// DynamicBootstrapObjectManager.instance.start();