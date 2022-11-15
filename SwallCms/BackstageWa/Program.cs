
// https://learn.microsoft.com/zh-cn/aspnet/core/blazor/?view=aspnetcore-6.0

using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.Configuration.Memory;
using ServerLib;
using ServerLib.Extensions;
using ServerLib.Util.Service.DiTesting;
using ServerLib.Util.Service.Sketch;
using BackstageWa.AppRazor;
using BackstageWa.Pages.Exercise;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

// 各种错误捕获方式
//builder.RootComponents.Add<DefaultApp>("#app");
//builder.RootComponents.Add<AppUsingErrorBoundLayout>("#app");
builder.RootComponents.Add<AppWrappedByErrorComponent>("#app");
//builder.RootComponents.Add<AppWithBoth>("#app");


builder.RootComponents.Add<HeadOutlet>("head::after");

//配置读取 wwwroot/config/cars.json  appsettings.development.json 配置文件
var http = new HttpClient()
{
    BaseAddress = new Uri(builder.HostEnvironment.BaseAddress),
};
builder.Services.AddScoped(sp => http);
string[] configFiles = new string[] { "appsettings.development.json", "config/cars.json" };
foreach (string cfg in configFiles)
{
    using var response = await http.GetAsync(cfg);
    using var stream = await response.Content.ReadAsStreamAsync();
    builder.Configuration.AddJsonStream(stream);
}


// 配置内存配置源
var vehicleData = new Dictionary<string, string>()
{
    {"color","blue" },
    {"type","car" },
    { "wheels:count","3"},
    {"wheels:brand","Blazin" },
    {"wheels:brand:type","rally" },
    {"wheels:year","2008" },
};
var memoryConfig = new MemoryConfigurationSource { InitialData = vehicleData };
builder.Configuration.Add(memoryConfig);

// 使用 ConfigurationBinder.Bind 来加载 Identity 提供程序的配置。 以下示例会加载 OIDC 提供程序的配置。
builder.Services.AddOidcAuthentication(options =>
    builder.Configuration.Bind("Local", options.ProviderOptions));

//  日志记录配置
builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));

// 主机生成器配置
var hostname = builder.Configuration["HostName"];

//Api调用,总是基于ServerApi.
//builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(Configing.ApiRoot) });

// 服务注册(为依赖注入准备)
builder.Services.AddScoped<ITimeTravel, TimeTravel>();

builder.Services.AddSingleton<NotifierService>();
builder.Services.AddSingleton<TimerService>();

//设置最低日志记录级别, (经测试没有发现影响)
//builder.Logging.SetMinimumLevel(LogLevel.Information);

// 若要在 Program.cs 中写入日志: ok
//var host = builder.Build();
//var logger = host.Services.GetRequiredService<ILoggerFactory>().CreateLogger<Program>();
//logger.LogDebug("Log debug in program.cs....................................");
//logger.LogInformation("Log information in program.cs.......................................");
//logger.LogError("Log error in program.cs......................");
//logger.LogCritical("Log critical in program.cs.....................................");

// 日志筛选之一: 只有指定日志种类, 同时指定级别的日志才记录.但 appsettings.json 中
// 有设定的不受此限制
//builder.Logging.AddFilter(
//    (_, category, logLevel) =>
//    category == "GuoshiCustomCategory" && logLevel < LogLevel.Warning
//     || category == "AnotherCustomCtgForMsgTpl" && logLevel > LogLevel.Warning
//    );
// 日志筛选之二: 禁用某命名空间下的(类型相关的)日志记录, 例如 ILogger<Common>. 以下任意一种办法:
//builder.Logging.AddFilter("BackstageWa.Pages.Exercise.Logger", LogLevel.None); // ok
//builder.Services.PostConfigure<LoggerFilterOptions>(options =>
//options.Rules.Add(
//    new LoggerFilterRule(null, "BackstageWa.Pages.Exercise.Logger", LogLevel.None, null)));

// 使用 GuoshiLogger 替换 默认的
//builder.Logging.ClearProviders().AddGuoshiLogger();

// 如果 "GuoshiLog" 是直接添加在 Logging 节点下, 可以不调用下一句, 因为前面已经有过调用
//builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));
// 但是如果另起炉灶, 则必须导入配置:
//builder.Logging.AddConfiguration(builder.Configuration.GetSection("OtherLogging"));

// 从 JavaScript 呈现 Razor 组件, 还需要 blazor afterStarted 后, 做相应操作. 已通过
//builder.RootComponents.RegisterForJavaScript<Counter>(identifier: "counter");



//Console.WriteLine("before await builder.Build().RunAsync()///////////////////////////////////////////// !");
await builder.Build().RunAsync();

// 后面的就不会执行
Console.WriteLine("after await builder.Build().RunAsync()///////////////////////////////////////////// !");


// 项目配置中默认 <PublishTrimmed>true</PublishTrimmed> 改为 false
// /exercise/di/timetravel-demo
// Cannot provide a value for property 'ScopeFactory' on type 'BlazorAppTemp.Pages.DependenceInject....' because the property has no setter.