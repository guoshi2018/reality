var _a;
import HeadChildNode from "./core/head-child-node.class.js";
import config from "./config/global.js";
export default class HeadChildNodeLoader {
    static get attachResultGroups() { return this._attachResultGroups; }
    static get successIDescriptors() {
        return this._filterIDescriptorBy("fulfilled");
    }
    static get failedIDescriptors() {
        return this._filterIDescriptorBy("rejected");
    }
    static _filterIDescriptorBy(status) {
        const descs = [];
        this._attachResultGroups.forEach(group => {
            group.forEach(result => {
                status == "fulfilled" && result.status == status && descs.push(result.value.descriptor) ||
                    status == "rejected" && result.status == status && descs.push(result.reason.descriptor) ||
                    status == "all" && descs.push(result.value ? result.value.descriptor : result.reason.descriptor);
            });
        });
        return descs;
    }
    static _removeScripts(status) {
        this._attachResultGroups.forEach(group => {
            group.forEach(result => {
                const t = result.value || result.reason;
                (status == "all" || status == result.status) && t.descriptor.tag == "script" &&
                    t.node.parentNode && t.node.remove();
            });
        });
    }
    static async start(options) {
        const opt = Object.assign({}, this._defaultOptions, options);
        const stuffGroups = [];
        !opt.abandonGlobal && stuffGroups.push(...config.globalStuffs);
        stuffGroups.push(...(options?.localStuffs || []));
        for (let i = 0; i < stuffGroups.length; i++) {
            const proms = stuffGroups[i].map(stuff => new HeadChildNode(stuff).attachAsync());
            const results = await Promise.allSettled(proms);
            this._attachResultGroups.push(results);
            !opt.release && console.log("one group attemped:", results);
        }
        if (!config.forceDebug) {
            this._removeScripts("rejected");
            opt.release && this._removeScripts("fulfilled");
            opt.release && HeadChildNode.loaderNode.remove();
        }
        opt.entry && opt.entry();
    }
}
_a = HeadChildNodeLoader;
HeadChildNodeLoader._defaultOptions = {
    abandonGlobal: false,
    localStuffs: [],
    release: false,
    entry: () => {
        console.log('success:', _a.successIDescriptors, 'failed:', _a.failedIDescriptors);
        console.log(`${HeadChildNode.loaderNode.src} running !`);
    },
};
HeadChildNodeLoader._attachResultGroups = [];
//# sourceMappingURL=head-child-node-loader.js.map