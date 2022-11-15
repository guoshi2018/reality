"use strict";
class EffectSelectorPersist {
    constructor(dblclick2quit, prompt, ways, select_class, aria_label) {
        this.ORIG_TITLE = "__orig__title";
        this._target = null;
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
            if (evt.target == this._select) {
                if (evt.button == 0) {
                    this._targets.forEach(tgt => {
                        if (tgt.getAttribute(`${ways}`)?.includes("h(disabled)") &&
                            (tgt.getAttribute("disabled") != null)) {
                            tgt.removeAttribute('disabled');
                            if (this._target == tgt) {
                                const opts = this._select.options;
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
        dblclick2quit && this._select.addEventListener('dblclick', this.dispose.bind(this));
        this._proxyTargetMousedownHandler = this._updateSelect.bind(this);
        this._targets = document.querySelectorAll(`[${ways}]`);
        this._targets.forEach(tgt => {
            this._modifyAndBackupTitle(tgt);
            tgt.addEventListener("mousedown", this._proxyTargetMousedownHandler);
            tgt.addEventListener("contextmenu", this._preventAndStop);
        });
    }
    static getInstance(dblclick2quit = true, prompt = "页面元素:右键选中;select:左键空白取消所有disabled,双击退出", ways = "ways", select_class = "form-select text-bg-dark position-fixed shadow-lg w-30 bottom-50 end-0", aria_label = "select to change element facade") {
        if (!EffectSelectorPersist._instance) {
            EffectSelectorPersist._instance = new EffectSelectorPersist(dblclick2quit, prompt, ways, select_class, aria_label);
        }
        return EffectSelectorPersist._instance;
    }
    _modifyAndBackupTitle(target) {
        const ways_str = target.getAttribute(`${this._ways}`);
        const title = `${target.tagName}:${ways_str}`;
        target[this.ORIG_TITLE] = target.getAttribute("title");
        target.setAttribute("title", title);
    }
    _updateSelect(evt) {
        const target = evt.currentTarget;
        if (evt.button == 2 && this._target != target) {
            this._resetSelect();
            this._waysToOptionsArray(target).forEach(opt => {
                this._select.options.add(opt);
            });
            this._target = target;
            this._preventAndStop(evt);
        }
    }
    _waysToOptionsArray(target) {
        const ps = this._getInitializingTOP();
        const options = [];
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
    _preventAndStop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }
    _resetSelect() {
        const len = this._select.length;
        for (let i = len - 1; i >= 0; i--) {
            this._select.options[i].remove();
        }
    }
    _setCurrentTarget() {
        if (this._target) {
            this._setTarget(this._target);
        }
    }
    _setTarget(target) {
        const processor = this._getSettingTOP();
        const opts = this._select.options;
        const len = opts.length;
        for (let i = 0; i < len; i++) {
            const opt = opts[i];
            this.__processTargetOption(processor, target, opt);
        }
    }
    _getInitializingTOP() {
        return {
            html_callback: (target, key, value, opt) => {
                opt.text = `${target.tagName}---html....${key}`;
                if (value) {
                    opt.text = `${opt.text} = ${value}`;
                }
                if (key == "style") {
                    const curr = target.getAttribute(key) || "";
                    opt.selected = curr.indexOf(value) != -1;
                }
                else {
                    opt.selected = target.getAttribute(key) == value;
                }
            },
            js_callback: (target, key, value, opt) => {
                opt.text = `${target.tagName}---js........${key}`;
                if (value) {
                    opt.text = `${opt.text} = ${value}`;
                }
                if (target[key]) {
                    opt.selected = true;
                }
                else {
                    opt.selected = false;
                }
            },
            class_callback: (target, key, opt) => {
                opt.text = `${target.tagName}---class...${key}`;
                opt.selected = target.classList.contains(key);
            }
        };
    }
    _getResettingTOP() {
        return {
            html_callback: (target, key) => {
                target.removeAttribute(key);
            },
            js_callback: (target, key) => {
                target[key] = undefined;
            },
            class_callback: (target, key) => {
                target.classList.remove(key);
            }
        };
    }
    _getSettingTOP() {
        return {
            html_callback: (target, key, value, opt) => {
                if (key == "style") {
                    const old = target.getAttribute(key) || "";
                    if (opt.selected && old.indexOf(value) == -1) {
                        target.setAttribute("style", `${old}${value}`);
                    }
                    else if (!opt.selected && old.indexOf(value) != -1) {
                        target.setAttribute("style", old.replace(value, ""));
                    }
                }
                else {
                    if (opt.selected) {
                        target.setAttribute(key, value);
                    }
                    else if (target.getAttribute(key) == value) {
                        target.removeAttribute(key);
                    }
                }
            },
            js_callback: (target, key, value, opt) => {
                if (opt.selected) {
                    target[key] = value;
                }
                else {
                    target[key] = undefined;
                }
            },
            class_callback: (target, key, opt) => {
                if (opt.selected) {
                    if (!target.classList.contains(key)) {
                        target.classList.add(key);
                    }
                }
                else {
                    if (target.classList.contains(key)) {
                        target.classList.remove(key);
                    }
                }
            }
        };
    }
    __processTargetOption(processor, target, opt) {
        const str = opt.value;
        const left_brk = str.indexOf('(');
        const right_brk = str.indexOf(')');
        const flag = str.slice(0, left_brk);
        if (flag && left_brk != -1 && right_brk != -1) {
            const k = str.slice(left_brk + 1, right_brk);
            const v = str.slice(right_brk + 1);
            switch (flag.toLowerCase()) {
                case 'h':
                    if (isNaN(Number(k))) {
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
    dispose() {
        console.log('dispose...');
        const ps = this._getResettingTOP();
        this._targets.forEach(tgt => {
            this._waysToOptionsArray(tgt).forEach(opt => {
                this.__processTargetOption(ps, tgt, opt);
            });
            if (tgt[this.ORIG_TITLE]) {
                tgt.setAttribute('title', tgt[this.ORIG_TITLE]);
            }
            else {
                tgt.removeAttribute("title");
            }
            tgt.removeEventListener("mousedown", this._proxyTargetMousedownHandler);
            tgt.removeEventListener("contextmenu", this._preventAndStop);
        });
        this._select.remove();
    }
}
//# sourceMappingURL=effect-selector-persist.js.map