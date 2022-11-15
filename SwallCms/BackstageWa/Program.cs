
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

// ���ִ��󲶻�ʽ
//builder.RootComponents.Add<DefaultApp>("#app");
//builder.RootComponents.Add<AppUsingErrorBoundLayout>("#app");
builder.RootComponents.Add<AppWrappedByErrorComponent>("#app");
//builder.RootComponents.Add<AppWithBoth>("#app");


builder.RootComponents.Add<HeadOutlet>("head::after");

//���ö�ȡ wwwroot/config/cars.json  appsettings.development.json �����ļ�
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


// �����ڴ�����Դ
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

// ʹ�� ConfigurationBinder.Bind ������ Identity �ṩ��������á� ����ʾ������� OIDC �ṩ��������á�
builder.Services.AddOidcAuthentication(options =>
    builder.Configuration.Bind("Local", options.ProviderOptions));

//  ��־��¼����
builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));

// ��������������
var hostname = builder.Configuration["HostName"];

//Api����,���ǻ���ServerApi.
//builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(Configing.ApiRoot) });

// ����ע��(Ϊ����ע��׼��)
builder.Services.AddScoped<ITimeTravel, TimeTravel>();

builder.Services.AddSingleton<NotifierService>();
builder.Services.AddSingleton<TimerService>();

//���������־��¼����, (������û�з���Ӱ��)
//builder.Logging.SetMinimumLevel(LogLevel.Information);

// ��Ҫ�� Program.cs ��д����־: ok
//var host = builder.Build();
//var logger = host.Services.GetRequiredService<ILoggerFactory>().CreateLogger<Program>();
//logger.LogDebug("Log debug in program.cs....................................");
//logger.LogInformation("Log information in program.cs.......................................");
//logger.LogError("Log error in program.cs......................");
//logger.LogCritical("Log critical in program.cs.....................................");

// ��־ɸѡ֮һ: ֻ��ָ����־����, ͬʱָ���������־�ż�¼.�� appsettings.json ��
// ���趨�Ĳ��ܴ�����
//builder.Logging.AddFilter(
//    (_, category, logLevel) =>
//    category == "GuoshiCustomCategory" && logLevel < LogLevel.Warning
//     || category == "AnotherCustomCtgForMsgTpl" && logLevel > LogLevel.Warning
//    );
// ��־ɸѡ֮��: ����ĳ�����ռ��µ�(������ص�)��־��¼, ���� ILogger<Common>. ��������һ�ְ취:
//builder.Logging.AddFilter("BackstageWa.Pages.Exercise.Logger", LogLevel.None); // ok
//builder.Services.PostConfigure<LoggerFilterOptions>(options =>
//options.Rules.Add(
//    new LoggerFilterRule(null, "BackstageWa.Pages.Exercise.Logger", LogLevel.None, null)));

// ʹ�� GuoshiLogger �滻 Ĭ�ϵ�
//builder.Logging.ClearProviders().AddGuoshiLogger();

// ��� "GuoshiLog" ��ֱ������� Logging �ڵ���, ���Բ�������һ��, ��Ϊǰ���Ѿ��й�����
//builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));
// �����������¯��, ����뵼������:
//builder.Logging.AddConfiguration(builder.Configuration.GetSection("OtherLogging"));

// �� JavaScript ���� Razor ���, ����Ҫ blazor afterStarted ��, ����Ӧ����. ��ͨ��
//builder.RootComponents.RegisterForJavaScript<Counter>(identifier: "counter");



//Console.WriteLine("before await builder.Build().RunAsync()///////////////////////////////////////////// !");
await builder.Build().RunAsync();

// ����ľͲ���ִ��
Console.WriteLine("after await builder.Build().RunAsync()///////////////////////////////////////////// !");


// ��Ŀ������Ĭ�� <PublishTrimmed>true</PublishTrimmed> ��Ϊ false
// /exercise/di/timetravel-demo
// Cannot provide a value for property 'ScopeFactory' on type 'BlazorAppTemp.Pages.DependenceInject....' because the property has no setter.