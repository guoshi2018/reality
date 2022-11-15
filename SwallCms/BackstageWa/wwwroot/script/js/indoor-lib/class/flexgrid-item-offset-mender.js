"use strict";
class FlexgridItemOffsetMender {
    constructor() {
        this.ROOT_SEL = 'body';
        this.ROW = "row";
        this.ROWR = "rowr";
        this.VROW = "vrow";
        this.VROWR = "vrowr";
        this.ROW_SEL = `.${this.ROW},.${this.ROWR},.${this.VROW},.${this.VROWR}`;
        this._rootObsWrp = new ObserverWrapper(this.ROOT_SEL);
        this._rootObsWrp.observerOptions.attributeFilter = ["class", "style"];
        this._flexEles = new LiveSet(Array.from(document.querySelectorAll(this.ROW_SEL)));
    }
    static get instance() {
        return this._instance;
    }
    start() {
        this._rootObsWrp.onNodeAdded(evt => {
            this._try_add_observe_correct(evt.addedChild);
        }).onAttributeChanged(evt => {
            if (evt.oldValue != evt.newValue) {
                const oldV = evt.oldValue || '';
                const newV = evt.newValue || '';
                const ele = evt.element;
                const p_newly = "attr->newly";
                const p_recome = "attr->recome";
                if (this._isCol(evt.element) && evt.attrName == "class") {
                    const prompt = this._tryToAddThenObserve(ele) ?
                        `[col] ${p_newly}` : `[col] ${p_recome}`;
                    this._tryCorrectAsCol(ele, prompt);
                }
                if (this._isRow(evt.element) &&
                    (evt.attrName == "class" ||
                        oldV.indexOf('width') != -1 || oldV.indexOf('height') != -1 ||
                        newV.indexOf('width') != -1 || newV.indexOf('height') != -1)) {
                    const prompt = this._tryToAddThenObserve(ele) ?
                        `[row] ${p_newly}` : `[row] ${p_recome}`;
                    this._tryCorrectAsRow(ele, prompt);
                }
            }
        }).start();
        this._rootObsWrp.observerOptions.subtree = false;
        this._flexEles.innerSet.forEach(ele => {
            this._rootObsWrp.observeNode(ele);
            this._tryCorrect(ele, 'init');
        });
    }
    stop() {
        this._rootObsWrp.stop();
    }
    _try_add_observe_correct(ele) {
        const prompt = this._tryToAddThenObserve(ele) ? "newly" : "recome";
        this._tryCorrect(ele, prompt);
    }
    _tryToAddThenObserve(ele) {
        let ok = false;
        if ((this._isCol(ele) || this._isRow(ele)) &&
            this._flexEles.add(ele) == true) {
            this._rootObsWrp.observeNode(ele);
            ok = true;
        }
        return ok;
    }
    _tryCorrect(ele, prompt) {
        let ok = false;
        ok = this._tryCorrectAsCol(ele, prompt);
        ok = this._tryCorrectAsRow(ele, prompt);
        return ok;
    }
    _tryCorrectAsRow(ele, prompt) {
        let count = 0;
        if (this._isRow(ele)) {
            console.warn(`fix row ${ele.tagName}:<${ele.className}>,details: ${prompt}`);
            Array.from(ele.children).forEach(son => {
                const col = son;
                if (this._tryCorrectAsCol(col, `by row ${ele.tagName}`)) {
                    count++;
                }
            });
        }
        return count > 0;
    }
    _tryCorrectAsCol(ele, prompt) {
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
    _isRow(ele) {
        const clsList = ele.classList;
        return clsList?.contains(this.ROW) || clsList?.contains(this.ROWR) ||
            clsList?.contains(this.VROW) || clsList?.contains(this.VROWR);
    }
    _isCol(ele) {
        const par = ele.parentElement;
        return par && this._isRow(par);
    }
}
FlexgridItemOffsetMender._instance = new FlexgridItemOffsetMender();
//# sourceMappingURL=flexgrid-item-offset-mender.js.map