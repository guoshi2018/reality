
/**
 * 描述符基接口默认值
 */
const defaultBasic: IDescriptorBasic = {
	timeout: 3000,
	willTriggerLoadOrError: false, // 除了文件型以外, 都不会引发加载成功或错误事件
}

/**
 * 文件型描述符接口默认值
 */
const defaultFiled: IFiledDescriptor = Object.assign({}, defaultBasic, {
	willTriggerLoadOrError: true, // 文件型节点(link 和非内嵌型 script), 均会引发加载成功或错误事件
} as IFiledDescriptor);


/**
 * 非内嵌型 script 脚本描述符接口默认值
 */
const defaultScriptUrl: IScriptUrlDescriptor = Object.assign({}, defaultFiled, {
	tag: "script",
	type: "text/javascript",
	nomodule: false,
} as IScriptUrlDescriptor);
/**
 * link 描述符
 */
const defaultLink: ILinkDescriptor = Object.assign({}, defaultFiled, {
	tag: "link",
	href: "url not provided",
	type: "text/css",
	rel: "stylesheet",
	importance: "auto",
} as ILinkDescriptor);
/**
 * 内联型 script 脚本描述符接口默认值
 */
const defaultScriptContent: IScriptContentDescriptor = Object.assign({}, defaultBasic, {
	tag: "script",
	type: "text/javascript",
	text: "console.log('inline script not found');",
	async: false,
} as IScriptContentDescriptor);
/**
 * base 节点描述符接口默认值
 */
const defaultBase: IBaseDescriptor = Object.assign({}, defaultBasic, {
	tag: "base",
	//href: document.location.href,
	//target: "_self",
} as IBaseDescriptor);
/**
 * title 节点描述符接口默认值
 */
const defaultTitle: ITitleDescriptor = Object.assign({}, defaultBasic, {
	tag: "title",
	textContent: document.location.href,
} as ITitleDescriptor);
/**
 * 同时可用于 name 型 / httpEquiv 型 / property 型 meta 节点描述符接口默认值
 */
const defaultAnyMeta: IAnyMetaDescriptor =
	Object.assign({}, defaultBasic, {
		tag: "meta",
		//	content: "...",
		charset: "utf-8",
	} as IAnyMetaDescriptor);

export default {
	/**
	 * ILinkDescriptor 的默认值
	 */
	defaultLink,
	/**
	 * IScriptUrlDescriptor 的默认值
	 */
	defaultScriptUrl,
	/**
	 * IScriptContentDescriptor 的默认值
	 */
	defaultScriptContent,
	/**
	 * IBaseDescriptor 的默认值
	 */
	defaultBase,
	/**
	 * ITitleDescriptor 的默认值
	 */
	defaultTitle,
	/**
	 * IMetaNameDescriptor/IMetaPropertyDescriptor/IMetaHttpEquivDescriptor 的共同默认值,
	 * 而不是它们的基接口 IMetaDescriptor
	 */
	defaultAnyMeta,
};



