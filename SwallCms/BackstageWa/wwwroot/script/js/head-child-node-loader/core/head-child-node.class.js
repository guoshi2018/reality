import config from "../config/global.js";
export default class HeadChildNode {
    constructor(descriptor) {
        let defaultDescriptor, currDescriptor;
        if (typeof descriptor == 'object') {
            descriptor.tag || Reflect.defineProperty(descriptor, "tag", {
                value: config.defaultTag,
                writable: false,
                enumerable: true,
                configurable: true,
            });
            currDescriptor = this._toScriptUrlIfAsyncScriptContent(descriptor);
            defaultDescriptor = currDescriptor.tag == "script" ?
                config.defaultDescriptors["src" in currDescriptor ? "defaultScriptUrl" : "defaultScriptContent"] :
                [...Object.values(config.defaultDescriptors)].find(drt => currDescriptor.tag == drt.tag);
            if (!defaultDescriptor) {
                console.error("error descriptor:", descriptor);
                throw new Error("one descriptor error at least");
            }
        }
        else {
            if (descriptor.endsWith('.js')) {
                currDescriptor = { src: descriptor, tag: "script" };
                defaultDescriptor = config.defaultDescriptors.defaultScriptUrl;
            }
            else {
                currDescriptor = { href: descriptor, tag: "link" };
                defaultDescriptor = config.defaultDescriptors.defaultLink;
            }
        }
        this._descriptor = Object.assign({}, defaultDescriptor, currDescriptor);
        this._node = document.createElement(this._descriptor.tag);
        Object.assign(this._node, this._descriptor);
    }
    get attachResult() { return this._attachResult; }
    static get loaderNode() {
        if (!this._loaderNode) {
            let ele_jss = document.getElementsByTagName('script');
            this._loaderNode = [...ele_jss].find(ele => ele.getAttribute("flag") == config.defaultFlag && ele.type == "module");
            if (!this._loaderNode) {
                throw new Error('未知错误, 无法查找加载器对应的 script 节点');
            }
        }
        return this._loaderNode;
    }
    ;
    get node() { return this._node; }
    _toScriptUrlIfAsyncScriptContent(descriptor) {
        let newlyDrt = descriptor;
        if (descriptor.tag == "script" && !("src" in descriptor)
            && descriptor.text.length > 0 && descriptor.async == true) {
            newlyDrt = Object.assign({}, descriptor, {
                src: URL.createObjectURL(new Blob([descriptor.text])),
            });
            Reflect.deleteProperty(newlyDrt, "text");
            Reflect.deleteProperty(newlyDrt, "async");
        }
        return newlyDrt;
    }
    attachAsync() {
        const node = this._node;
        const commonOpt = {
            descriptor: this._descriptor,
            node,
        };
        return this._isSameNodeExist2() ?
            new Promise((resolve, reject) => {
                reject(this._attachResult = Object.assign({}, commonOpt, {
                    error: 101, message: "abandon to attach, for at least one duplicate node found.",
                }));
            }) :
            new Promise((resolve, reject) => {
                HeadChildNode.loaderNode.before(node);
                if (this._descriptor.willTriggerLoadOrError) {
                    node.addEventListener('load', (evt) => {
                        resolve(this._attachResult = Object.assign({}, commonOpt, {
                            error: 0, message: "loaded successfully"
                        }));
                    });
                    node.addEventListener('error', (evt) => {
                        reject(this._attachResult = Object.assign({}, commonOpt, {
                            error: 102, message: "failed to load, for an unexpected error has occurred while loading, perhaps file not found!"
                        }));
                    });
                    setTimeout(() => {
                        reject(this._attachResult = Object.assign({}, commonOpt, {
                            error: 103, message: "sorry, load timeout."
                        }));
                    }, this._descriptor.timeout);
                }
                else {
                    resolve(this._attachResult = Object.assign({}, commonOpt, {
                        error: 200, message: "unknown result without loaded event listened."
                    }));
                }
            });
    }
    _isSameNodeExist1() {
        const newAttrs = [...this._node.attributes];
        return [...document.head.children].findIndex(node => node.tagName == this._node.tagName &&
            node.textContent == this._node.textContent &&
            [...node.attributes].every(exsAttr => newAttrs.findIndex(attr => exsAttr.value == attr.value && exsAttr.name == attr.name) != -1)) != -1;
    }
    _isSameNodeExist2() {
        const newAttrs = [...this._node.attributes];
        return [...document.head.children].findIndex(node => node.tagName == this._node.tagName &&
            node.textContent == this._node.textContent &&
            newAttrs.every(attr => [...node.attributes].findIndex(extAttr => extAttr.value == attr.value && extAttr.name == attr.name) != -1)) != -1;
    }
    _isSameNodeExist3() {
        return false;
    }
}
//# sourceMappingURL=head-child-node.class.js.map