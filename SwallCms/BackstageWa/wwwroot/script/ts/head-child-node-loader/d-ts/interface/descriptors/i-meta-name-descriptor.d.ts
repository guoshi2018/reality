
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */


/**
 * meta 节点(name 型)描述符接口, 继承于 IMetaDescriptor
 */
interface IMetaNameDescriptor extends IMetaDescriptor {
    /**
     * name 应和 content 属性可以一起使用，以名 - 值对的方式给文档提供元数据，
     * 其中 name 作为元数据的名称，content 作为元数据的值
     */
    name: MetaName;
    /**
 * 因与 name 互斥, IMetaNameDescriptor 不能包含 name
 */
    httpEquiv?: never;
    /**
     * 因与 name 互斥, IMetaNameDescriptor 不能包含 property
     */
    property?: never;
}