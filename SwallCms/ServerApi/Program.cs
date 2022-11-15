
using ServerLib;

var builder = WebApplication.CreateBuilder(args);

#region  跨域配置三部曲 1/3 , 定义跨域策略.注意,主机名应同时在appsettings.json的AllowdHost配置列表中.(后来发现 AllowedHost 不用设置)
//string AllowOrigins = "_backstageAndFrontpage";
builder.Services.AddCors(options =>
{
    //如果使用命名策略配合中间件的cors:
    options.AddPolicy(
     //   name: AllowOrigins,
     name: Configing.AllowedCorPolicyName,
        corsPolicyBuilder =>
        {
            corsPolicyBuilder.WithOrigins(Configing.AllowedHosts);
        });
});
#endregion

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

// 跨域配置三部曲 2/3 ,启用跨域.如果启用所有则不带参数
app.UseCors(Configing.AllowedCorPolicyName);

app.UseAuthorization();

app.MapControllers();

app.Run();
