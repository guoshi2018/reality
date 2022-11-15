
/**
 * 修正页面上当前使用 .vrow / .vrowr 构造的flex网格, 涉及使用 .offset-mq-n 对
 * item 做的偏移的所有元素的 margin-top/margin-bottom.
 * (内部已经设置 flex-direction 分别是 column 和 column-reverse),  
 * 在使用 offset-mq-(1,2,3,4,5) 形式(其中mq代表屏幕宽度断点)制造item偏移. 
 * 说明: 根源在于百分数基数内定为width, 而不是height, 得到的错误的margin-top, margin-bottom.
 * 见 mdn 说明: 百分比值<percentage> 总是相对于 父元素块的宽度
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/margin-top
 */
function correctAllVerticalFlexOffset() {
    document.querySelectorAll('.vrow,.vrowr').forEach(row => {
        Array.from(row.children).forEach(col => {
            fixFlexGridColMargin(col as HTMLElement);
        })
    })
}

/**
 * 修正指定元素的 .vrow / .vrowr 下的 offset,
 * @param col 指定元素
 * 说明: 函数自动检查该 col 是否符合修正条件, 不符合则忽略
 * 注意, 当横向 row 参与到 竖向 row 的切换中来, 它的 offset 引起的 margin,
 * 虽然浏览器计算正确, 但是竖向的 margin 却不会自动清除. 所以...
 * @return 修正完成(不一定有变化)返回true, 无需修正(例如元素不合格)返回false
 */
function fixFlexGridColMargin(col: HTMLElement) {
    const ele_classname = col.className;
    const par = col.parentElement;
    let ok = false;
    if (par) {
        const par_cptStyle = getComputedStyle(par, null);
        if (par_cptStyle.display == "flex") {
            const par_classname = par.className;

            // 切换成不包含 offset- 时, 需要所有margin为0
            col.style.marginLeft = col.style.marginRight =
                col.style.marginTop = col.style.marginBottom = "";
            // 包含 .offset-(1,2,), 还需要 .col(-...) 系列的类, 或者父级具备隐式声明
            // 元素的 col 的性质. 才有必要修补
            if (ele_classname.indexOf("offset-") != -1 &&
                (ele_classname.indexOf("col") != -1 || par_classname.indexOf("row-cols-") != -1)) {

                // 1. 反复设置其他 margin 的目的: 当 .row .rowr .vrow .vrowr 中两个以上 
                // class 同时应用到一个 element, 虽然此时的 flex 方向最终仍然是唯一的. 
                // 但就是这种不大可能出现的极端情况, 不设置其他margin, 可能会出现两个或两个
                // 以上的外边距. 
                // 2. 横向 .row .rowr 之一, 与纵向 .vrow .vrowr 之一共存, 虽然这应该
                // 只存在于调试中, 同 1, 虽然最终的 flexDirection 是一定的, 但会有上次
                // 状态的宽度(或高度)残留, 导致不太美观. 不过关系不大. 如果只保留一种 row
                // 即可
                switch (par_cptStyle.flexDirection) {
                    case "column":
                        fixMarginY(col, "marginTop");
                        col.style.marginLeft = col.style.marginRight = col.style.marginBottom = "0px";
                        break;
                    case "column-reverse":
                        fixMarginY(col, "marginBottom");
                        col.style.marginLeft = col.style.marginRight = col.style.marginTop = "0px";
                        break;
                    case "row-reverse":
                        col.style.marginRight = getComputedStyle(col, null).marginRight;
                        col.style.marginLeft = col.style.marginTop = col.style.marginBottom = "0px";
                        break;
                    default: // default to row
                        col.style.marginLeft = getComputedStyle(col, null).marginLeft;
                        col.style.marginTop = col.style.marginRight = col.style.marginBottom = "0px";
                        break;
                }
            }
            ok = true;
        }
    }
    return ok;
}

/**
 * 将采用百分数结合父元素可占宽度得到的元素的Y方向的margin值(参见mdn), 修正为
 * 结合父元素可占高度的对应值.
 * @param ele 要修改值得元素
 * @param margins 指定要修正哪个值
 */
function fixMarginY(ele: HTMLElement, mg: "marginTop" | "marginBottom") {
    const parent = ele.parentElement as HTMLElement;
    const pW = parent.clientWidth;
    const pH = parent.clientHeight;
    const cptStyle = getComputedStyle(ele, null);

    // 必须设置为空值, 以便每次调用 getComputedStyle 得到的值, 都与当前的百分数对应
    // 一句话: 不重置, 则第二次调用会设置错误
    ele.style[mg] = '';
    const orig_value = parseFloat(cptStyle[mg]);
    const fixed_value = orig_value * pH / pW;
    ele.style[mg] = `${fixed_value}px`;
}

// function marginBasedY(ele: HTMLElement,mg:"marginTop" | "marginBottom") {
// 		const parent = ele.parentElement as HTMLElement;
// 	const pW = parent.clientWidth;
// 	const pH = parent.clientHeight;
// 	const cptStyle = getComputedStyle(ele, null);

// 		// 必须设置为空值, 以便每次调用 getComputedStyle 得到的值, 都与当前的百分数对应
// 		// 一句话: 不重置, 则第二次调用会设置错误
// 		ele.style[mg] = '';
// 		const orig_value = parseFloat(cptStyle[mg]);
// 		const fixed_value = orig_value * pH / pW;
// 		ele.style[mg] = `${fixed_value}px`;

// }


/**
 * 在整个页面上, 折叠所有的 details, 不论其初始设置为何;
 * 然后展开最后一个位于 details 及其祖先 details.
 * 没有则忽略
 */
function openLastDetails() {
    let ds = document.querySelectorAll("details");
    let ele: HTMLElement | null = ds[ds.length - 1];
    ds.forEach(dt => {
        dt.removeAttribute("open");
    });
    while (ele) {
        if (ele instanceof HTMLDetailsElement) {
            ele.setAttribute("open", "");
        }
        ele = ele.parentElement;
    }
}

/**
 * 获取guid字符串
 * */
function guidString() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return "s" + v.toString(16);
    });
};

/**
 * 克隆源元素, 替换目标元素.
 * @param root 只检查此元素内部. 默认为整个文档, 即 body
 * @param tag 要替换的元素的标签. 默认为 ele-clone. 注意标签不能自结束.
 * @param ref_id 上述元素, 用来指定源元素id的属性名. 默认为 ref-id
 * @remark 页面上所有的这种标签元素, 均被其 ref_id 标识的属性名称指定的
 * 	 源元素的拷贝替换 
 */
function cloneWithId(root: Element = document.documentElement || document.body, tag: string = "ele-clone", ref_id: string = "ref-id") {

    // 如果要克隆的元素, 存在子级, 就无法避免平行子级重复 id
    Array.from(root.children).forEach(ele => {
        if (ele.tagName.toLowerCase() == tag.toLowerCase()) {
            const source_id = ele.getAttribute(ref_id);
            if (source_id) {
                const source = document.getElementById(source_id);
                if (source) {
                    const source_copy = source.cloneNode(true) as HTMLElement;
                    const id = ele.id?.trim();
                    source_copy.id = id || guidString(); // 优先采用 ele-clone 自带的id, 未指定则guid
                    ele.replaceWith(source_copy);
                    //继续检查被克隆替换的元素, 其子级是否有需要克隆
                    cloneWithId(ele, tag, ref_id);
                }
            }
        } else {
            cloneWithId(ele, tag, ref_id);
        }
    })
}

/**
 * 修正元素的重复id, 采用 guid 字符串赋予新值
 */
function fixDuplicateIDs() {
    const arr_id: Array<string> = [];
    handle(document.body);

    function handle(root: Element) {
        Array.from(root.children).forEach(ele => {
            if (arr_id.indexOf(ele.id) != -1) {
                // 既然是guid, 可以保证不会重复, 也就不用压入arr_id了
                ele.id = guidString();
            } else {
                arr_id.push(ele.id);
            }
            handle(ele);
        })
    }
}
/**
 * 延时一段时间
 * @param ms 延时的毫秒数
 * @returns 一个承诺
 */
function delay(ms: number): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(`${ms} million seconds timeout!`), ms);
    });
};