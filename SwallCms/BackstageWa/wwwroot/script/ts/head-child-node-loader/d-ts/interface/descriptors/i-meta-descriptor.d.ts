
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */


/**
 * meta 节点描述符接口, 继承于 IDescriptorBasic, 作为 IMetaHttpEquivDescriptor 的基接口
 */
interface IMetaDescriptor extends IDescriptorBasic {
    /**
     * meta 元素标签名, 只可能是 meta
     */
    tag: "meta",
    /**
     * 属性声明了文档的字符编码。如果使用了这个属性，其值必须是与 ASCII 
     * 大小写无关（ASCII case-insensitive）的"utf-8"。
     */
    charset?: "utf-8",
    /**
     * 包含 http-equiv 或 name 属性的值， 具体取决于所使用的值。
     */
    content: string;

}