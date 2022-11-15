
using ServerLib;

var builder = WebApplication.CreateBuilder(args);

#region  �������������� 1/3 , ����������.ע��,������Ӧͬʱ��appsettings.json��AllowdHost�����б���.(�������� AllowedHost ��������)
//string AllowOrigins = "_backstageAndFrontpage";
builder.Services.AddCors(options =>
{
    //���ʹ��������������м����cors:
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

// �������������� 2/3 ,���ÿ���.������������򲻴�����
app.UseCors(Configing.AllowedCorPolicyName);

app.UseAuthorization();

app.MapControllers();

app.Run();
