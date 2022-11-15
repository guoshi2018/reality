
import { blazorReady } from "/script/js/index.js"
export function beforeStart(options, extensions) {
    console.log("beforeStart: app / page is null:", document.querySelector('#app').querySelector('.page'));
    console.log("options:", options, "extensions:", extensions);
}

export function afterStarted(blazor) {
    //console.log("afterStarted: app / page is full:", document.querySelector('#app').querySelector('.page'));
    //console.log("blazor:", blazor);
    //let couterWrapper = document.getElementById('my-counter-from-razor');

    //await blazor.rootComponents.add(couterWrapper, 'counter', {});
    blazorReady(blazor);
}