
/**
 * 注意: 默认值请查看全局默认配置文件 default-descriptors.ts
 */


/**
 * meta 节点(http-equiv 型)描述符接口, 继承于 IMetaDescriptor
 */
interface IMetaHttpEquivDescriptor extends IMetaDescriptor {
    /**
     * 定义了一个编译指示指令。这个属性叫做 http-equiv(alent) 是因为所有允许的值
     * 都是特定 HTTP 头部的名称. 和 name 类似, 它也是使用 content 作为元数据的值
     */
    httpEquiv: MetaHttpEquiv;
    /**
     * 因与 httpEquiv 互斥, IMetaHttpEquivDescriptor 不能包含 name
     */
    name?: never;
    /**
     * 因与 httpEquiv 互斥, IMetaHttpEquivDescriptor 不能包含 property
     */
    property?: never;
}