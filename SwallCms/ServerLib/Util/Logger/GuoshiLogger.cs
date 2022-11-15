using Microsoft.Extensions.Logging;
using static System.Console;
using static ServerLib.Util.Logger.GuoshiLoggerConfiguration;

namespace ServerLib.Util.Logger
{
    /// <summary>
    /// 自定义日志记录器
    /// </summary>
    public sealed class GuoshiLogger : ILogger
    {
        private readonly string name;
        private readonly Func<GuoshiLoggerConfiguration> getCurrentConfig;

        public GuoshiLogger(
            string name, Func<GuoshiLoggerConfiguration> getCurrentConfig)
        => (this.name, this.getCurrentConfig) = (name, getCurrentConfig);

        public IDisposable BeginScope<TState>(TState state) => default!;

        public bool IsEnabled(LogLevel logLevel) => getCurrentConfig().LogLevels.ContainsKey(logLevel);

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            if (IsEnabled(logLevel))
            {
                GuoshiLoggerConfiguration config = getCurrentConfig();
                if (config.EventId == 0 || config.EventId == eventId.Id)
                {
                    switch (config.LogLevels[logLevel])
                    {
                        case LogFormat.Short:
                            WriteLine($"{name}:{formatter(state, exception)}");
                            break;
                        case LogFormat.Long:
                            WriteLine($"[{eventId.Id,2}:{logLevel,-12}]{name}-{formatter(state, exception)}");
                            break;
                        default:
                            break;
                    }
                }
            }
        }

    }
}
