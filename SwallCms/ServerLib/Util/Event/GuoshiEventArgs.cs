using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib.Util.Event
{
    // 配置自定义事件之 2/3: 定义该事件对应于 C# 端的包含事件参数的类
    public class GuoshiEventArgs : EventArgs
    {
        //    public string? GuoshiFirstProp { get; set; }
        //    public string? GuoshiSecondProp { get; set; }
        public string? Guoshi_first_prop { get; set; }
        public string? Guoshi_second_prop { get; set; }
        public string? Guoshi_third_prop { get; set; }
    }


}
