import HeadChildNodeLoader from "./head-child-node-loader/head-child-node-loader.js";
HeadChildNodeLoader.start({
    release: false,
    localStuffs: [
        [
            {
                tag: "title",
                textContent: "后台页面 - backstagewa welcome",
            },
        ],
        [
            {
                tag: "script",
                text: "console.log('this is text from script text attribute.(content script)');",
                timeout: 4000,
            },
            {
                tag: "script",
                async: true,
                text: "console.log('this is text from script text attribute.(url script)');",
                timeout: 4000,
            },
        ]
    ],
    entry: () => {
        DynamicBootstrapObjectManager.instance.start();
        console.log('entry called');
        window.addEventListener('load', evt => {
            console.log("当你看到这句话时, 说明还可以监听 window 的 load 事件!");
        });
    }
});
window.simulateCollapseButtonEvent = (evtType) => {
    const menuBtn = document.getElementById('menu-icon');
    if (getComputedStyle(menuBtn).display != "none") {
        menuBtn.dispatchEvent(new Event(evtType));
        console.log('simu click menu button');
    }
};
window.isCollapseSectionShow = (id) => {
    let ok = false;
    const ele = document.getElementById(id);
    if (ele) {
        const clses = ele.classList;
        console.log('current class is :', clses);
        ok = clses.contains("collapse") && clses.contains("show");
    }
    else {
        console.warn("one collapse section not found by id");
    }
    console.log('[client]is shown: ', ok);
    return ok;
};
export async function blazorReady(blazor) {
    console.log("afterStarted: app / page is full:", document.querySelector('#app')?.querySelector('.page'));
    console.log("blazor:", blazor);
    blazor.registerCustomEventType('guoshievent', {
        createEventArgs: (evt) => {
            return {
                guoshi_first_prop: 'first value',
                guoshi_second_prop: "second  value",
                guoshi_third_prop: evt.srcElement.innerText,
            };
        }
    });
    document.getElementById('guoshi-trigger')?.addEventListener('click', function (evt) {
        const evt1 = new Event('guoshievent', {
            bubbles: true,
            guoshi_third_prop: "new value for third property",
        });
        const evt2 = new CustomEvent("guoshievent", {
            bubbles: true,
            detail: {
                guoshi_second_prop: "new value for second property",
            },
            guoshi_third_prop: "new value for third property",
        });
        this.previousElementSibling?.dispatchEvent(evt1);
        this.previousElementSibling?.dispatchEvent(evt2);
    });
    blazor.registerCustomEventType('guoshipaste', {
        browserEventName: 'paste',
        createEventArgs: (evt) => {
            return {
                eventTimestamp: new Date(),
                pastedData: evt.clipboardData?.getData('text')
            };
        }
    });
}
//# sourceMappingURL=index.js.map