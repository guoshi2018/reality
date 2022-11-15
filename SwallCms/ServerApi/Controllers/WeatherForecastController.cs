using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using ServerLib;
using ServerLib.Demo;

namespace ServerApi.Controllers
{
    //跨域三部曲之 3/3. 标记跨域
    [EnableCors(Configing.AllowedCorPolicyName)]       //ok
    [ApiController]
    [Route("[controller]/[action]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        //[HttpGet("{action}")]
        //[HttpGet]       //default to httpGet already.
        public IEnumerable<WeatherForecast> RandomData()
        {
            Thread.Sleep(2000);
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}