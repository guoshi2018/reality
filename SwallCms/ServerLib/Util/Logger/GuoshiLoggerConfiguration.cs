using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace ServerLib.Util.Logger
{
    /// <summary>
    /// 自定义的记录器提供程序
    /// </summary>
    public class GuoshiLoggerConfiguration
    {
        public int EventId { get; set; }
        public Dictionary<LogLevel, LogFormat> LogLevels { get; set; } = new()
        {
            [LogLevel.Information] = LogFormat.Short,
            [LogLevel.Warning] = LogFormat.Short,
            [LogLevel.Error] = LogFormat.Long
        };
        /// <summary>
        /// 配置分配日志格式的目的是可以通过应用配置文件 appsettings.json 轻松更改日志格式
        /// </summary>
        public enum LogFormat { Short, Long }
    }
}
