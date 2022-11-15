"use strict";
var _a;
class DynamicBootstrapObjectTogglerManager {
    constructor() {
        this.SHOW_CLASS = "show";
        this.BS_TOGGLER = "data-bs-toggle";
        this.BS_TARGET = "data-bs-target";
        this.H_HREF = "href";
        this.ATTR_FILTERS = [
            this.BS_TOGGLER,
        ];
        this.BS_COMS = [
            {
                name: "toast",
                constructor: "Toast",
            }
        ];
        this.ROOT_SEL = 'body';
        this._rootObsWrp = new ObserverWrapper(this.ROOT_SEL);
        this._rootObsWrp.observerOptions.attributeFilter = this.ATTR_FILTERS;
        this._toggleHandler = this._toggleShow.bind(this);
    }
    static get instance() {
        return this._instance;
    }
    start() {
        this._rootObsWrp.onNodeAdded(evt => {
            if (this._isTrigger(evt.element)) {
                this._setupHandler(evt.element);
            }
        }).onAttributeChanged(evt => {
            const o = evt.oldValue;
            const n = evt.newValue;
            if (o != n) {
                if (this._verifyAttr(o) && !this._verifyAttr(n)) {
                    this._setupHandler(evt.element, false);
                }
                else if (!this._verifyAttr(o) && this._verifyAttr(n)) {
                    this._setupHandler(evt.element);
                }
            }
        }).start();
        let selector = "";
        this.BS_COMS.forEach(com => {
            selector += `[${this.BS_TOGGLER}=${com.name}],`;
        });
        selector = selector.slice(0, -1);
        document.querySelectorAll(selector).forEach(ele => {
            this._setupHandler(ele);
        });
    }
    stop() {
        this._rootObsWrp.stop();
    }
    _setupHandler(ele, setup = true) {
        const hele = ele;
        if (hele) {
            console.info(`${setup ? "install" : "uninstall"} toggler handler for one element`);
            hele[setup ? "addEventListener" : "removeEventListener"]('click', this._toggleHandler);
        }
    }
    _isTrigger(ele) {
        return this._verifyAttr(ele.getAttribute(this.BS_TOGGLER));
    }
    _verifyAttr(v) {
        return this.BS_COMS.find(info => info.name == v) != undefined;
    }
    _queryContructorName(ele) {
        const com_name = ele.getAttribute(this.BS_TOGGLER);
        const com = this.BS_COMS.find(com => com.name == com_name);
        return com ? com.constructor : "";
    }
    _toggleShow(evt) {
        const trigger = evt.target;
        if (trigger) {
            const ctor = this._queryContructorName(trigger).trim();
            const selector = trigger.getAttribute(this.BS_TARGET) || trigger.getAttribute(this.H_HREF);
            if (ctor.length > 0 && selector) {
                document.querySelectorAll(selector).forEach(target => {
                    const bsObj = this._refreshTargetComponent(target, ctor);
                    if (target.classList.contains(this.SHOW_CLASS)) {
                        bsObj.hide();
                    }
                    else {
                        bsObj.show();
                    }
                });
            }
        }
    }
    _refreshTargetComponent(target, ctor) {
        return new bootstrap[ctor](target);
    }
}
_a = DynamicBootstrapObjectTogglerManager;
DynamicBootstrapObjectTogglerManager._instance = new _a();
//# sourceMappingURL=dynamic-bootstrap-object-toggler-manager.js.map