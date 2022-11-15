const defaultBasic = {
    timeout: 3000,
    willTriggerLoadOrError: false,
};
const defaultFiled = Object.assign({}, defaultBasic, {
    willTriggerLoadOrError: true,
});
const defaultScriptUrl = Object.assign({}, defaultFiled, {
    tag: "script",
    type: "text/javascript",
    nomodule: false,
});
const defaultLink = Object.assign({}, defaultFiled, {
    tag: "link",
    href: "url not provided",
    type: "text/css",
    rel: "stylesheet",
    importance: "auto",
});
const defaultScriptContent = Object.assign({}, defaultBasic, {
    tag: "script",
    type: "text/javascript",
    text: "console.log('inline script not found');",
    async: false,
});
const defaultBase = Object.assign({}, defaultBasic, {
    tag: "base",
});
const defaultTitle = Object.assign({}, defaultBasic, {
    tag: "title",
    textContent: document.location.href,
});
const defaultAnyMeta = Object.assign({}, defaultBasic, {
    tag: "meta",
    charset: "utf-8",
});
export default {
    defaultLink,
    defaultScriptUrl,
    defaultScriptContent,
    defaultBase,
    defaultTitle,
    defaultAnyMeta,
};
//# sourceMappingURL=default-descriptors.js.map