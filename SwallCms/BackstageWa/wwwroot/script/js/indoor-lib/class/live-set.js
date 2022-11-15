"use strict";
class LiveSet {
    constructor(iterable) {
        this._innerSet = new Set(iterable);
        this._addCallbacks = new Set();
        this._deleteCallbacks = new Set();
        this._clearCallbacks = new Set();
    }
    add(value) {
        let ok = false;
        if (Array.from(this._innerSet.values()).indexOf(value) == -1) {
            this._innerSet.add(value);
            this._addCallbacks.forEach(cb => cb({
                type: 'add',
                vary: value,
            }), this);
            ok = true;
        }
        return ok;
    }
    delete(value) {
        const ok = this._innerSet.delete(value);
        if (ok) {
            this._deleteCallbacks.forEach(cb => cb({
                type: 'delete',
                vary: value,
            }), this);
        }
        return ok;
    }
    clear() {
        const clone = new Set(this._innerSet);
        this._innerSet.clear();
        let ok = false;
        if (clone.size > 0) {
            this._clearCallbacks.forEach(cb => cb({
                type: 'clear',
                last: clone,
            }), this);
            ok = true;
        }
        return ok;
    }
    onAdd(callback) {
        this._addCallbacks.add(callback);
        return this;
    }
    offAdd(callback) {
        this._addCallbacks.delete(callback);
        return this;
    }
    onDelete(callback) {
        this._deleteCallbacks.add(callback);
        return this;
    }
    offDelete(callback) {
        this._deleteCallbacks.delete(callback);
        return this;
    }
    onClear(callback) {
        this._clearCallbacks.add(callback);
        return this;
    }
    offClear(callback) {
        this._clearCallbacks.delete(callback);
        return this;
    }
    get innerSet() {
        return this._innerSet;
    }
    static fromNodeList(items) {
        const set = new LiveSet();
        items.forEach(item => {
            set._innerSet.add(item);
        });
        return set;
    }
}
//# sourceMappingURL=live-set.js.map