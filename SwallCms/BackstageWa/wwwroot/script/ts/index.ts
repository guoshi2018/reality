

import HeadChildNodeLoader from "./head-child-node-loader/head-child-node-loader.js";
//import { prefixBaseAddr } from "./head-child-node-loader/config/global.js";

HeadChildNodeLoader.start({

    //abandonGlobal: true,
    release: false,
    localStuffs: [
        [
            {
                // 如果 razor page 缺少 <PageTitle> 组件, 则显示该 title
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
        //to do
        DynamicBootstrapObjectManager.instance.start();

        console.log('entry called');
        window.addEventListener('load', evt => {
            console.log("当你看到这句话时, 说明还可以监听 window 的 load 事件!");
        })
    }
});
/**
 * 模拟模拟窄屏才显示的折叠按钮事件
 * 被 NavMenu.razor 调用时, C# 段提供事件参数 'click', 实现点击导航菜单项后,折叠按钮被单击.
 * 处理为简单地为 nav-menu 移除 show class 也能凑效, 但丧失了折叠动画. 
 * 条件: 必须保证折叠按钮正常显示(窄屏), 否则在宽屏下, 会得到奇怪的效果(点击菜单项, 整个菜单全部被折叠).
 * @param evtType 事件类型
 */
//@ts-ignore
window.simulateCollapseButtonEvent = (evtType: string) => {

    // document.getElementById('nav-menu')?.classList.remove('show');

    const menuBtn = document.getElementById('menu-icon') as HTMLButtonElement;
    if (getComputedStyle(menuBtn).display != "none") {
        menuBtn.dispatchEvent(new Event(evtType));
        console.log('simu click menu button');
    }
}

//@ts-ignore  fail to get
//window.getCollapseSectionDelay = (id: string) => {
//    const ele = document.getElementById(id);
//    if (ele) {
//        //@ts-ignore
//        const bsClps = bootstrap.Collapse.getOrCreateInstance(ele);
//        if (bsClps) {
//            console.log(bsClps);
//        }
//    }
//}


//@ts-ignore
window.isCollapseSectionShow = (id: string) => {
    let ok = false;
    const ele = document.getElementById(id);
    if (ele) {
        const clses = ele.classList;
        console.log('current class is :', clses);
        ok = clses.contains("collapse") && clses.contains("show");
    } else {
        console.warn("one collapse section not found by id");
    }
    console.log('[client]is shown: ', ok);
    return ok;
}



/**
 * blazor  assembly 加载完成, 自动调用. 原理是在 BackstageWa.lib.module.js 中 Import 
 * index.js, 然后由其 afterStarted 函数调用
 * @param blazor Blazor 对象
 */
export async function blazorReady(blazor: any) {
    console.log("afterStarted: app / page is full:", document.querySelector('#app')?.querySelector('.page'));
    console.log("blazor:", blazor);
    // 经 program.cs 中配置后, 可从 JavaScript 呈现 Razor 组件
    //let couterWrapper = document.getElementById('my-counter-from-razor');
    //await blazor.rootComponents.add(couterWrapper, 'counter', {});

    // 配置自定义事件之 1/3: js 端注册, 以确定该事件包含的参数
    blazor.registerCustomEventType('guoshievent', {
        createEventArgs: (evt: Event) => {
            return {
                guoshi_first_prop: 'first value',
                guoshi_second_prop: "second  value",
                guoshi_third_prop: (evt.srcElement as HTMLButtonElement).innerText,
            }
        }
    });

    document.getElementById('guoshi-trigger')?.addEventListener('click', function (evt) {
        const evt1 = new Event('guoshievent', {
            bubbles: true,
            //@ts-ignore
            guoshi_third_prop: "new value for third property",
        });
        const evt2 = new CustomEvent("guoshievent", {
            bubbles: true,
            detail: {
                guoshi_second_prop: "new value for second property",// 不能彰显 
            },
            //@ts-ignore
            guoshi_third_prop: "new value for third property",
        })
        this.previousElementSibling?.dispatchEvent(evt1);
        this.previousElementSibling?.dispatchEvent(evt2);
    });

    // 上面的自定义事件仅仅是演示配置步骤, 无实际意义. 下面来点实际的
    //注册自定义的剪贴板粘贴事件
    blazor.registerCustomEventType('guoshipaste', {
        browserEventName: 'paste', // 这样就可以使用原生事件触发
        createEventArgs: (evt: ClipboardEvent) => {
            return {
                eventTimestamp: new Date(),
                pastedData: evt.clipboardData?.getData('text')
            }
        }
    });
}