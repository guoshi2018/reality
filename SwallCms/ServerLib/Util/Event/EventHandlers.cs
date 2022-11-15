using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib.Util.Event
{
    // 配置自定义事件之 3/3: 通过为自定义事件添加 EventHandlerAttribute 特性注释，
    // 连接自定义事件和事件参数。 此类不需要成员。 请注意，类必须命名为 EventHandlers，
    // 才能由 Razor 编译器找到
    // 注意客户端 js 触发时, 必须指定 bubbles:true, 否则，事件无法到达 Blazor 处理程序
    [EventHandler("onguoshievent", typeof(GuoshiEventArgs),
    enableStopPropagation: true, enablePreventDefault: true)]
    [EventHandler("onguoshipaste", typeof(GuoshiPasteEventArgs),
        enableStopPropagation: true, enablePreventDefault: true)]
    public static class EventHandlers { }
}
