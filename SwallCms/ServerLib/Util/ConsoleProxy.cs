using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerLib.Util
{
    public static class ConsoleProxy
    {
        public static void WriteTabs(int tabs)
        {
            for (int i = 0; i < tabs; i++)
            {
                Console.Write("\t");
            }
        }
    }
}
