"use strict";
class DynamicBootstrapObjectManager {
    constructor() {
        this.BS_TOGGLER = "data-bs-toggle";
        this.BS_TARGET = "data-bs-target";
        this.H_HREF = "href";
        this.ROOT_SEL = 'body';
        this.ATTR_FILTERS = [
            this.BS_TOGGLER,
            this.BS_TARGET,
            this.H_HREF,
        ];
        this._bsObjOptions = [
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
        this._rootObsWrp = new ObserverWrapper(this.ROOT_SEL);
        const filter = [...this.ATTR_FILTERS];
        this._bsObjOptions.forEach(opt => {
            filter.push(...opt.attrs);
        });
        this._rootObsWrp.observerOptions.attributeFilter = filter;
        this._objHull = {};
    }
    static get instance() {
        return this._instance;
    }
    start() {
        this._rootObsWrp.onNodeAdded(evt => {
            this._tryBsObject(evt.element);
        }).onAttributeChanged(evt => {
            if (evt.oldValue != evt.newValue) {
                this._tryBsObject(evt.element);
            }
        }).start();
        let selector = "";
        this._bsObjOptions.forEach(opt => {
            selector += `[${this.BS_TOGGLER}=${opt.toggle_flag}],`;
        });
        selector = selector.slice(0, -1);
        document.querySelectorAll(selector).forEach(ele => {
            this._saveInstance(ele);
        });
    }
    stop() {
        this._rootObsWrp.stop();
    }
    _tryBsObject(ele) {
        this._deleteObject(ele);
        this._saveInstance(ele);
    }
    _deleteObject(ele) {
        if (!ele.id) {
            ele.id = guidString();
        }
        if (this._objHull[ele.id]) {
            this._objHull[ele.id].dispose();
            this._objHull[ele.id] = null;
        }
    }
    _saveInstance(ele) {
        if (!ele.id) {
            ele.id = guidString();
        }
        const constructor_name = this._findTypeName(ele).trim();
        if (constructor_name.length > 0) {
            this._objHull[ele.id] = bootstrap[constructor_name].getOrCreateInstance(ele);
        }
    }
    _findTypeName(ele) {
        const flag = ele.getAttribute(this.BS_TOGGLER);
        const opt = this._bsObjOptions.find(v => v.toggle_flag == flag);
        return opt ? opt.type_name : "";
    }
}
DynamicBootstrapObjectManager._instance = new DynamicBootstrapObjectManager();
//# sourceMappingURL=dynamic-bootstrap-object-manager.js.map