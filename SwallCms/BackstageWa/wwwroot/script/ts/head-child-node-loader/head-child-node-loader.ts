
import HeadChildNode from "./core/head-child-node.class.js";
import config from "./config/global.js";



/**
 * html 文档的 head 节点的直接子节点, 例如 script link base meta title 等
 * 的动态加载器 
 */
export default class HeadChildNodeLoader {
    /**
     * 默认的加载器的启动选项
     */
    private static _defaultOptions: IStartOptions = {
        abandonGlobal: false,
        localStuffs: [],
        release: false,
        entry: () => {
            console.log('success:', this.successIDescriptors, 'failed:', this.failedIDescriptors);
            console.log(`${HeadChildNode.loaderNode.src} running !`);
        },
    };

    /**
     * 保存各组加载承诺结果(对于 script, 组内部无依赖, 组之间可能会有依赖)的二维数组.
     */
    private static _attachResultGroups: PromiseSettledResult<IAttachResult>[][] = [];
    /**
     * 获取保存各组加载承诺结果(对于 script, 组内部无依赖, 组之间可能会有依赖)的二维数组
     */
    public static get attachResultGroups() { return this._attachResultGroups; }

    /**
     * 获取加载成功的描述符接口
     */
    public static get successIDescriptors() {
        return this._filterIDescriptorBy("fulfilled");
    }
    /**
     * 获取加载失败的描述符接口
     */
    public static get failedIDescriptors() {
        return this._filterIDescriptorBy("rejected");
    }

    /**
     * 过滤成功或失败或不过滤的描述符
     * @param status 指定过滤方式
     * @returns 过滤后的描述符数组
     */
    private static _filterIDescriptorBy(status: "fulfilled" | "rejected" | "all") {
        const descs: Array<IAnyDescriptor> = [];
        this._attachResultGroups.forEach(group => {
            group.forEach(result => {
                status == "fulfilled" && result.status == status && descs.push(result.value.descriptor) ||
                    status == "rejected" && result.status == status && descs.push(result.reason.descriptor) ||
                    //@ts-ignore
                    status == "all" && descs.push(result.value ? result.value.descriptor : result.reason.descriptor);
            })
        });
        return descs;
    }

    /**
     * 根据指定的过滤条件, 移除 script node.
     * @param status 过滤条件
     */
    private static _removeScripts(status: "fulfilled" | "rejected" | "all") {
        this._attachResultGroups.forEach(group => {
            group.forEach(result => {
                //@ts-ignore
                const t: IAttachResult = result.value || result.reason;
                // 对于检测出会重复的节点, 并未尝试附加. 虽然对它调用 remove 方法也没什么异常.
                (status == "all" || status == result.status) && t.descriptor.tag == "script" &&
                    t.node.parentNode && t.node.remove();
            })
        });
    }



    /**
     * 启动加载器
     * @param options 启动选项
     */
    public static async start(options?: IStartOptions) {
        //      debugger;

        // 合并选项
        const opt = Object.assign({}, this._defaultOptions, options);

        // 合并要加载的资源构成的二维数组(全局与局部)
        const stuffGroups: IAnyDescriptorOrString[][] = [];
        !opt.abandonGlobal && stuffGroups.push(...config.globalStuffs);
        stuffGroups.push(...(options?.localStuffs || []));

        // 不能采用 forEach, 对于组之间是阻塞加载(以便准备好依赖), 对于组内部是异步加载(可提高效率)
        // 得到第一组结果, 才继续第二组, 以此类推
        for (let i = 0; i < stuffGroups.length; i++) {
            const proms = stuffGroups[i].map(stuff => new HeadChildNode(stuff).attachAsync());
            const results = await Promise.allSettled(proms);
            this._attachResultGroups.push(results);
            // debug show
            !opt.release && console.log("one group attemped:", results);
        }

        if (!config.forceDebug) {
            // 移除加载失败, 同时, 非调试状态, 还移除加载成功节点及入口加载节点;启动客户端入口方法 
            this._removeScripts("rejected");
            opt.release && this._removeScripts("fulfilled");
            opt.release && HeadChildNode.loaderNode.remove();
        }
        opt.entry && opt.entry();
    }

}

/*
注意 tsconfig.json/target=es2017+

*/

