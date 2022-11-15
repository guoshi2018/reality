

//#region 类型定义

/**
 * document 的 head 节点下, 可能存在的节点 tag 名
 */
type HeadChildTag = "script" | "link" | "meta" | "base" | "title";
/**
 * document 的 head 节点下, 可能存在的节点类型
 */
type HTMLHeadChildElement = HTMLScriptElement | HTMLLinkElement |
    HTMLMetaElement | HTMLBaseElement | HTMLTitleElement;

/**
 * 表示文档、文件或字节流的性质和格式
 * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 */
type HtmlMime =
    "text/plain" | "text/html" | "text/css" | "text/javascript" | "module" |

    "image/gif" | "image/jpeg" | "image/png" | "image/bmp" | "image/webp" | "image/x-icon" |
    "image/vnd.microsoft.icon" | "image/svg+xml" |

    "audio/midi" | "audio/mpeg" | "audio/webm" | "audio/ogg" | "audio/wav" | "audio/wave" |
    "audio/x-wav" | "audio/x-pn-wav" | "" |

    "video/mp4" | "video/webm" | "video/ogg" |

    "application/pkcs12" | "application/json" | "application/vnd.mspowerpoint" |
    "application/xhtml+xml" | "application/xml" | "application/pdf" | "application/ogg" |
    "application/javascript" | "application/ecmascript" | "application/octet-stream" |
    "application/x-rar-compressed" |

    "multipart/form-data" | "multipart/byteranges" | "multipart/byteranges";

/**
 * link 和 script 节点, 定义跨域允许
 */
type LinkScriptCorg = "" | "anonymous" | "use-credentials";

/**
 * 获取资源时引荐来源网址的策略
 */
type LinkScriptRefPlc = "no-referrer" | "no-referrer-when-downgrade" | "origin"
    | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin"
    | "unsafe-url";

/**
 * link 节点的链接类型, 用于填写 rel 属性, 可以多个, 以逗号分隔. 其中,
 * "apple-touch-icon" | "apple-touch-startup-icon" 仅适用于 IOS
 */
type LinkRel = "alternate" | "alternate" | "author" | "bookmark" | "canonical"
    | "dns-prefetch" | "external" | "first" | "prev" | "next" | "last"
    | "help" | "icon" | "import" | "index" | "license" | "manifest"
    | "modulepreload" | "nofollow" | "noopener" | "noreferrer" | "opener" | "pingback"
    | "preconnect" | "prefetch" | "preload" | "prerender" | "search" | "shortlink"
    | "sidebar" | "stylesheet" | "tag" | "up" | "apple-touch-icon" | "apple-touch-startup-icon";

/**
 * 仅在<link>元素设置了 rel="preload" 或者 rel="prefetch"。
 * 它规定了<link>元素加载的内容的类型，对于内容的优先级、请求匹配、正确的内容
 * 安全策略的选择以及正确的 Accept请求头的设置，这个属性是必需的
 */
type LinkAs = "audio" | "document" | "embed" | "fetch" | "font"
    | "image" | "object" | "script" | "style" | "track" | "video" | "worker";
/**
 * link 引用的资源的重要性
 */
type LinkImp = "auto" | "high" | "low";

/**
 * 标准元数据名称
 * name 和 content 属性可以一起使用，以名 - 值对的方式给文档提供元数据，
 * 其中 name 作为元数据的名称，content 作为元数据的值。最后一个仅适用于 ios
 */
type MetaName = "application-name" | "author" | "description" | "generator" | "keywords"
    | "referrer" | "theme-color" | "color-scheme" | "viewport" | "creator" | "googlebot"
    | "publisher" | "robots" | "apple-itunes-app";

/**
 * Meta 定义的预编译指令名, 其中之一用作 http-equiv 的名称
 */
type MetaHttpEquiv = "content-security-policy" | "content-type" | "default-style"
    | "x-ua-compatible" | "refresh";

type IAnyScriptDescriptor = IScriptUrlDescriptor | IScriptContentDescriptor;
/**
 * meta 描述符实体接口之一
 */
type IAnyMetaDescriptor = IMetaNameDescriptor | IMetaHttpEquivDescriptor | IMetaPropertyDescriptor;

/**
 * 描述实体接口之一
 */
type IAnyDescriptor =
    IAnyScriptDescriptor |
    ILinkDescriptor |
    IBaseDescriptor |
    ITitleDescriptor |
    IAnyMetaDescriptor
    ;

/**
 * 描述实体接口之一, 还可以是字符串
 */
type IAnyDescriptorOrString = IAnyDescriptor | string;



