using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ServerLib.Util.Service.Sketch
{
    /// <summary>
    /// 示例用: 结合 TimerService 在外部调用组件方法以更新状态
    /// </summary>
    public class NotifierService
    {
        public async Task Update(string key, int value)
        {
            if (Notify != null)
            {
                await Notify.Invoke(key, value);
            }
        }

        public event Func<string, int, Task>? Notify;
    }
}
