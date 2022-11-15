import defaultDescriptors from "./default-descriptors.js";
const debugBase = false;
const tempBaseAddr = debugBase ? "/temp/abc/" : "/";
export const prefixBaseAddr = debugBase ? "../../" : "";
export default {
    forceDebug: false,
    defaultFlag: "load-head",
    defaultTag: "script",
    defaultDescriptors,
    globalStuffs: [
        [
            { tag: "meta", name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
            { tag: "meta", name: "description", content: "后台页面, 使用 Blazor + head-child-node-loader" },
            { tag: "meta", name: "author", content: "St.Wall Studio" },
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
            { tag: "base", href: tempBaseAddr },
            `/script/js/indoor-lib/function/guoshi/tool.js`,
            `/script/js/indoor-lib/class/observer-wrapper.js`,
        ],
        [
            `/script/js/indoor-lib/class/dynamic-bootstrap-object-manager.js`,
        ]
    ],
};
//# sourceMappingURL=global.js.map