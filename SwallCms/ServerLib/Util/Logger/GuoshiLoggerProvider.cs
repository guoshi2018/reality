using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ServerLib.Util.Logger
{
    [ProviderAlias("GuoshiLog")]
    public sealed class GuoshiLoggerProvider : ILoggerProvider
    {
        private readonly IDisposable onChangeToken;
        private GuoshiLoggerConfiguration config;
        private readonly ConcurrentDictionary<string, GuoshiLogger> loggers =
            new(StringComparer.OrdinalIgnoreCase);

        public GuoshiLoggerProvider(
            IOptionsMonitor<GuoshiLoggerConfiguration> config)
        {
            this.config = config.CurrentValue;
            onChangeToken = config.OnChange(updatedConfig => this.config = updatedConfig);
        }

        public ILogger CreateLogger(string categoryName) =>
            loggers.GetOrAdd(categoryName, name => new GuoshiLogger(name, GetCurrentConfig));

        private GuoshiLoggerConfiguration GetCurrentConfig() => config;

        public void Dispose()
        {
            loggers.Clear();
            onChangeToken.Dispose();
        }
    }
}
