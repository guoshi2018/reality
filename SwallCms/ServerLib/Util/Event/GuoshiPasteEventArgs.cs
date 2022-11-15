using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib.Util.Event
{
    public class GuoshiPasteEventArgs : EventArgs
    {
        // 与 js 端注册时的字段名称对应
        public DateTime EventTimestamp { get; set; }
        public string? PastedData { get; set; }
    }


}
