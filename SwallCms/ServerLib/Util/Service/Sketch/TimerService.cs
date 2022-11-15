using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib.Util.Service.Sketch
{
    /// <summary>
    /// 示例用: 结合 NotifierService 在外部调用组件方法以更新状态
    /// </summary>
    public class TimerService : IDisposable
    {
        private int elapsedCount;
        private readonly static TimeSpan heartbeatTickRate = TimeSpan.FromSeconds(2);
        private readonly ILogger<TimerService> logger;
        private readonly NotifierService notifier;
        private PeriodicTimer? timer;
        private CancellationTokenSource? cancelSrc;

        public TimerService(NotifierService notifier,
            ILogger<TimerService> logger)
        {
            this.notifier = notifier;
            this.logger = logger;
            //     cancelSrc = new CancellationTokenSource();
        }

        public async Task Start()
        {
            if (timer is null)
            {
                timer = new(heartbeatTickRate);
                logger.LogInformation("Started");
                cancelSrc = new CancellationTokenSource();
                using (timer)
                {
                    while (await timer.WaitForNextTickAsync(cancelSrc.Token))
                    {
                        elapsedCount += 1;
                        await notifier.Update("elapsedCount", elapsedCount);
                        logger.LogInformation($"elapsedCount: {elapsedCount}");
                    }
                }
            }
        }
        public void Stop()
        {
            cancelSrc?.Cancel(false);
            Dispose();
            timer = null;
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}
