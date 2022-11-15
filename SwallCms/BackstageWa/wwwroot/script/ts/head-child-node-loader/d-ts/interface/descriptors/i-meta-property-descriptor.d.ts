
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */


/**
 * meta 节点(property 型)描述符接口, 继承于 IMetaDescriptor
 */
interface IMetaPropertyDescriptor extends IMetaDescriptor {
    /**
     * property 应和 content 属性可以一起使用，以名 - 值对的方式给文档提供元数据，
     * 其中 property 作为元数据的名称，content 作为元数据的值
     */
    property: string;
    /**
     * 因与 property 互斥, IMetaPropertyDescriptor 不能包含 name
     */
    name?: never;
    /**
     * 因与 property 互斥, IMetaPropertyDescriptor 不能包含 httpEquiv
     */
    httpEquiv?: never;
}