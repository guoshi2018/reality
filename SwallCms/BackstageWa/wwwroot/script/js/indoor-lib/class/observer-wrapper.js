"use strict";
class ObserverWrapper {
    constructor(selector) {
        this._selector = selector;
        this._observer = new MutationObserver(this._observeCallback.bind(this));
        this._observerOptions = {
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true,
            childList: true,
            subtree: true,
        };
        this._nodeAddedCallbacks = new Set([]);
        this._nodeRemovedCallbacks = new Set([]);
        this._attributeChangedCallbacks = new Set([]);
        this._characterDataChangedCallbacks = new Set([]);
    }
    get observerOptions() {
        return this._observerOptions;
    }
    set observerOptions(value) {
        this._observerOptions = value;
    }
    start() {
        document.querySelectorAll(this._selector).forEach(ele => {
            this._observer.observe(ele, this._observerOptions);
        });
        return this;
    }
    observeNode(target) {
        this._observer.observe(target, this._observerOptions);
    }
    stop() {
        const restRcd = this._observer.takeRecords();
        this._observeCallback(restRcd, this._observer);
        this._observer.disconnect();
        return this;
    }
    onNodeAdded(callback) {
        this._nodeAddedCallbacks.add(callback);
        return this;
    }
    offNodeAdded(callback) {
        this._nodeAddedCallbacks.delete(callback);
        return this;
    }
    onNodeRemoved(callback) {
        this._nodeRemovedCallbacks.add(callback);
        return this;
    }
    offNodeRemoved(callback) {
        this._nodeRemovedCallbacks.delete(callback);
        return this;
    }
    onAttributeChanged(callback) {
        this._attributeChangedCallbacks.add(callback);
        return this;
    }
    offAttributeChanged(callback) {
        this._attributeChangedCallbacks.delete(callback);
        return this;
    }
    onCharacterDataChanged(callback) {
        this._characterDataChangedCallbacks.add(callback);
        return this;
    }
    _observeCallback(mutations, observer) {
        mutations.forEach(mut => {
            const element = mut.target;
            switch (mut.type) {
                case "childList":
                    mut.addedNodes.forEach(ele => {
                        this._nodeAddedCallbacks.forEach(cb => cb({
                            element,
                            addedChild: ele,
                            prevOfList: mut.previousSibling,
                            nextOfList: mut.nextSibling,
                        }), this);
                    });
                    mut.removedNodes.forEach(ele => {
                        this._nodeRemovedCallbacks.forEach(cb => cb({
                            element,
                            removedChild: ele,
                            prevOfList: mut.previousSibling,
                            nextOfList: mut.nextSibling,
                        }), this);
                    });
                    break;
                case "attributes":
                    this._attributeChangedCallbacks.forEach(cb => cb({
                        element,
                        attrName: mut.attributeName,
                        space: mut.attributeNamespace,
                        oldValue: mut.oldValue,
                        newValue: element.getAttribute(mut.attributeName || ""),
                    }), this);
                    break;
                case "characterData":
                    this._characterDataChangedCallbacks.forEach(cb => cb({
                        element,
                        oldValue: mut.oldValue || "",
                        newValue: element.innerHTML,
                    }), this);
                    break;
                default:
                    break;
            }
        });
    }
}
//# sourceMappingURL=observer-wrapper.js.map