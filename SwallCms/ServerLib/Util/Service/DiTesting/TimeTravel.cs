using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib.Util.Service.DiTesting
{

    public class TimeTravel : ITimeTravel
    {
        public DateTime DT { get; set; } = DateTime.Now;
    }
}
