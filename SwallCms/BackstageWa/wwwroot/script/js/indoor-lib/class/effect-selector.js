"use strict";
class EffectSelector {
    constructor(dblclick2quit = true, flag = "右键点击元素选中;左键点击select空白取消选中;中键点击select空白还原", ways = "ways", select_class = "form-select text-bg-light position-fixed shadow-lg w-30 bottom-50 end-0", aria_label = "select to change element facade") {
        this.ORIG_TITLE = "__orig__title";
        this._target = null;
        this._targetResetted = false;
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
            if (evt.target == this._select) {
                if (evt.button == 0) {
                    this._targetResetted = false;
                    this._uncheckAllOptions();
                    if (!this._targetResetted) {
                        this._resetTarget();
                    }
                }
                else if (evt.button == 1) {
                    this._resetTarget();
                    this._resetSelect();
                    this._target = null;
                }
            }
        });
        if (dblclick2quit) {
            this._select.addEventListener('dblclick', this.dispose.bind(this));
        }
        this._select.options.add(opt);
        document.body.append(this._select);
        this._proxyTargetMousedownHandler = this._refreshSelectOptions.bind(this);
        this._proxyTargetContextmenuHandler = this._disableContextmenu.bind(this);
        this._targets = document.querySelectorAll(`[${ways}]`);
        this._targets.forEach(tgt => {
            this._modifyAndBackupTitle(tgt);
            tgt.addEventListener("mousedown", this._proxyTargetMousedownHandler);
            tgt.addEventListener("contextmenu", this._proxyTargetContextmenuHandler);
        });
    }
    _uncheckAllOptions() {
        for (let i = 0; i < this._select.options.length; i++) {
            this._select.options[i].selected = false;
        }
    }
    _modifyAndBackupTitle(target) {
        const ways = target.getAttribute("ways");
        const title = `${target.tagName}:${ways}`;
        target[this.ORIG_TITLE] = target.getAttribute("title");
        target.setAttribute("title", title);
    }
    _refreshSelectOptions(evt) {
        const target = evt.currentTarget;
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
                });
            }
            evt.preventDefault();
            evt.stopPropagation();
        }
    }
    _disableContextmenu(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }
    _resetSelect() {
        const len = this._select.length;
        for (let i = len - 1; i > 0; i--) {
            this._select.options[i].remove();
        }
    }
    _resetTarget() {
        this._handleTarget(this._select.options, false);
        this._targetResetted = true;
    }
    _setTarget() {
        this._resetTarget();
        this._handleTarget(this._select.selectedOptions, true);
    }
    _handleTarget(options, attach = true) {
        if (this._target) {
            const opts = options;
            const len = opts.length;
            let text = '', flag = '', k = '', v = '';
            let idx = -1, left_brk = -1, right_brk = -1;
            for (let i = 0; i < len; i++) {
                text = opts[i].text;
                left_brk = text.indexOf('(');
                right_brk = text.indexOf(')');
                flag = text.slice(0, left_brk);
                if (flag && left_brk != -1 && right_brk != -1) {
                    k = text.slice(left_brk + 1, right_brk);
                    v = text.slice(right_brk + 1);
                    switch (flag.toLowerCase()) {
                        case 'h':
                            if (isNaN(Number(k))) {
                                attach && this._target?.setAttribute(k, v),
                                    !attach && this._target?.removeAttribute(k);
                            }
                            break;
                        case 'j':
                            attach && (this._target[k] = v), !attach && (this._target[k] = undefined);
                            break;
                        case 'c':
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
    dispose() {
        console.log('dispose...');
        this._resetTarget();
        this._target = null;
        this._targets.forEach(tgt => {
            if (tgt[this.ORIG_TITLE]) {
                tgt.setAttribute('title', tgt[this.ORIG_TITLE]);
            }
            else {
                tgt.removeAttribute("title");
            }
            tgt.removeEventListener("mousedown", this._proxyTargetMousedownHandler);
            tgt.removeEventListener("contextmenu", this._proxyTargetContextmenuHandler);
        });
        this._select.remove();
    }
}
//# sourceMappingURL=effect-selector.js.map