

/**
 * 加载结果类型
 */
interface IAttachResult {
    /**
     * 节点, 不管加载成功与否, 节点总是生成
     */
    readonly node: HTMLHeadChildElement;
    /**
     * 生成节点采用的描述结构
     */
    readonly descriptor: IAnyDescriptor;
    /**
     * 错误码, 未发生错误则为0
     */
    readonly error: number,
    /**
     * 描述本次加载结果的消息
     */
    readonly message: string,
}