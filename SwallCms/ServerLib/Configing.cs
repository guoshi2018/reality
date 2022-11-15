using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib;

public static class Configing
{
    #region Api url
    /// <summary>
    /// api根路径, 部署时,可能需要修改,必需与ServerApi/Properties/launchSetting.json一致
    /// </summary>
    public const string ApiRoot = "https://localhost:7011";

    /// <summary>
    /// WeatherForecast的get api目标(包括Controller名和action),居于ApiRoot
    /// </summary>
    public const string Api_RandomWeatherForcast = "WeatherForecast/RandomData";

    #endregion

    /// <summary>
    /// 允许跨域访问ServerApi的策略名.
    /// </summary>
    public const string AllowedCorPolicyName = "Backstage and Frontpage";

    /// <summary>
    /// 允许跨域访问ServerApi的主机名数组(含协议):后端管理url, 前端页面url
    /// </summary>
    public static string[] AllowedHosts = new string[] {
        // IIS Express
        "https://localhost:44308","http://localhost:6614",

        // Project (BackstageWa)
        "https://localhost:7025","http://localhost:5025",

        // other
        "http://localhost:8080","http://localhost:12345","http://localhost:54321"
    };

}
