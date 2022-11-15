

import defaultDescriptors from "./default-descriptors.js";

const debugBase = false;
const tempBaseAddr = debugBase ? "/temp/abc/" : "/";

export const prefixBaseAddr = debugBase ? "../../" : "";
/**
 * 全局配置
 */
export default {
    /**
     * 强制进入调试状态, 不管加载器启动文件如何设置
     */
    forceDebug: false,
    /**
     * 需要唯一使用 <script> 标签引用的 js 节点, flag 属性默认值,
     * 以此判断加载节点位置
     */
    defaultFlag: "load-head",
    /**
     * tag 默认值
     */
    defaultTag: "script" as HeadChildTag,

    /**
     * 保存了所有实体描述符接口的默认配置的数组
     */
    defaultDescriptors,

    /**
     * 全局使用的资源, 先于本地(局部)资源加载(如果需要的话)
     * 类似于下面这样的资源加载, 作为动态导入, 可能会使得 index.ts 错过 window 的 onload 事件
     * <link href="manifest.json" rel="manifest" />
     * <link href="image/png/index/icon-512.png" rel="apple-touch-icon" sizes="512x512" />
     * <link href="image/png/index/icon-192.png" rel="apple-touch-icon" sizes="192x192" />
     * 此时就应该用  "javascript初始值设定项" 的 afterstarted 事件了.
     */
    globalStuffs: [
        [
            { tag: "meta", name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
            { tag: "meta", name: "description", content: "后台页面, 使用 Blazor + head-child-node-loader" },
            { tag: "meta", name: "author", content: "St.Wall Studio" },
            // 必须指定, 否则在某个 razor 页面 刷新时, 由于 href 默认为其 location
            // 后续的 blazor Assembly 相关脚本在做内部调用(查找)其他文件, 会找不到
            { tag: "base", href: "/" },
            { tag: "link", href: `/manifest.json`, rel: "manifest" },
            { tag: "link", href: `/image/png/index/icon-512.png`, rel: "apple-touch-icon", sizes: "512x512" },
            { tag: "link", href: `/image/png/index/icon-192.png`, rel: "apple-touch-icon", sizes: "192x192" }
        ],
        [
            "/style/css/index.css",
            "/BackstageWa.styles.css",
        ],
        [
            `/_framework/blazor.webassembly.js`,
            `/external-core/blazor/service.js`,
            `/external-core/custom-bootstrap5.2/bootstrap.bundle.js`,
        ],
        [
            // 修改一次, 对后续起作用, 但由于上面的 base.href="/" 必须配置,
            // 所以这里即使配置也被忽略
            { tag: "base", href: tempBaseAddr },
            `/script/js/indoor-lib/function/guoshi/tool.js`,
            `/script/js/indoor-lib/class/observer-wrapper.js`,
        ],
        [
            `/script/js/indoor-lib/class/dynamic-bootstrap-object-manager.js`,
        ]

    ] as IAnyDescriptorOrString[][],

};