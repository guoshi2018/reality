using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using System;

namespace ServerLib.Razor
{
    //    public abstract class RazorNavItemComponentBase : ComponentBase
    //    {

    //        public abstract NavItemFlag Flag { get;}

    //    }
    /// <summary>
    /// 封装用于导航项点击打开的 Razor 页面的必要信息
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class NavItemFlagAttribute : Attribute
    {
        /// <summary>
        /// 获取或设置是否启用该 Razor 页面到导航, 默认为true
        /// </summary>
        public bool Enabled { get; set; } = true;
        /// <summary>
        /// 获取或设置导航的目标网址, 可能包含参数, 默认为空字符串
        /// </summary>
        public string LinkTo { get; set; } = "";
        /// <summary>
        /// 获取或设置导航项的文本, 默认为 "undefined nav item text"
        /// </summary>
        public string Text { get; set; } = "undefined nav item text";

        private string _tooltip = "";
        /// <summary>
        /// 获取或设置鼠标 hover 时的提示文本, 默认与 LinkTo 和 Text 属性中, 较长者一致
        /// </summary>
        public string Tooltip
        {
            get
            {
                if (_tooltip.Length == 0)
                {
                    _tooltip = LinkTo.Length > Text.Length ? LinkTo : Text;
                }
                return _tooltip;
            }
            set { _tooltip = value; }
        }
        /// <summary>
        /// 获取或设置用于导航项的图标,例如配置为 oi-bell, 则使用下列格式生成图标:
        /// &lt;span class="oi oi-home " aria-hidden="true" /&gt; Text(当IconAtRear为false时)
        /// 默认为空字符串
        /// </summary>
        public string Icon { get; set; } = "";
        /// <summary>
        /// 获取或设置图标是否位于导航项文本的后方, 默认为 false
        /// </summary>
        public bool IconAtRear { get; set; } = false;

        public override string ToString()
        {
            return $"Enabled:{Enabled},LinkTo:{LinkTo},Text:{Text},Tooltip:{Tooltip},Icon:{Icon},IconAtRear:{IconAtRear}"; ;
        }
    }

}
