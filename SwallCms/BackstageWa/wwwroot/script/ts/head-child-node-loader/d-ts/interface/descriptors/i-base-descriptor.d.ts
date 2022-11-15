
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */


/**
 * base 节点描述符接口, 继承于 IDescriptorBasic
 * 注意与它的基接口 IDescriptorBasic 书写上的区别
 * 只能出现一次 <base> 节点, 但是 <base> 节点之前加载的节点, 例如 script, link 等需要
 * 配合确定绝对地址的标签, 会采用默认的 document.location.href, 然后新的 <base> 只对它身后
 * 的 script, link 起作用. 如果后续在添加 <base>, 则被忽略. 
 * 上述基本上来源于MDN, 但经过测试, 准确说法应该是: base 节点内的每个属性可以显式设置一次.
 * 由于 href 或 target 均可单次配置, 所以将其设置为可未定义
 */
interface IBaseDescriptor extends IDescriptorBasic {
    /**
     * base 元素标签名, 只可能是 base
     */
    tag: "base";
    /**
     * 用于文档中相对 URL 地址的基础 URL。允许绝对和相对 URL, 用作
     * 文档中 <a>,<form> 等节点的基地址, 当它们采用的是相对地址时起作用.
     * 例外: 开放标签(即没有关闭符号的标签, 例如 meta), 应始终具有绝对URL, 
     * 因为它不接受 <base> 配置.
     * 注意, 默认为当前 html 文档所在目录(浏览器默认即如此), 而不是网站根目录.
     */
    href?: string;
    /**
     * 载入结果使用的目标, 类似于 <form> <a> 标签的同名属性
     * _self / _blank / _parent / _top / 其他作者定义的窗口名称
     * default to _self
     */
    target?: string;
}