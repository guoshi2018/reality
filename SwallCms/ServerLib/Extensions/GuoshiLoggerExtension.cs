using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Configuration;
using ServerLib.Util.Logger;

namespace ServerLib.Extensions
{
    public static class GuoshiLoggerExtensions
    {
        public static ILoggingBuilder AddGuoshiLogger(
            this ILoggingBuilder builder)
        {
            builder.AddConfiguration();

            builder.Services.TryAddEnumerable(
                ServiceDescriptor.Singleton<ILoggerProvider, GuoshiLoggerProvider>());

            LoggerProviderOptions.RegisterProviderOptions
                <GuoshiLoggerConfiguration, GuoshiLoggerProvider>(builder.Services);

            return builder;
        }
    }
}
