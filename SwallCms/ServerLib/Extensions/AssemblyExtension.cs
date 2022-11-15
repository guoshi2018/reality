using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Runtime.CompilerServices;

namespace ServerLib.Extensions
{
    public static class AssemblyExtension
    {

        /// <summary>
        /// 获取配件内的所有根命名空间, 注意无命名空间的 class, 其命名空间为空字符串
        /// </summary>
        /// <param name="asm">要查询根命名空间集合的配件</param>
        /// <returns>根命名空间集合</returns>
        [Obsolete("应使用无参的 GetChildNamespaces 方法")]
        public static string[] GetRootNamespaces(this Assembly asm)
        {
            Regex regRootNamespace = new Regex(@"^(?<NS>[\w]+)\.[\w.]+$");
            List<string> result = new();
            foreach (Type t in asm.GetTypes())
            {
                string ns = regRootNamespace.Match(t.FullName ?? "").Groups["NS"].Value;
                result.Add(ns);
            }

            return result.Distinct().ToArray();
        }

        /// <summary>
        /// 获取配件内指定命名空间下的直接子命名空间名称
        /// </summary>
        /// <param name="asm">指定配件</param>
        /// <param name="parentNmsp">在此命名空间下,查询直接子命名空间名称, 默认为"", 则获取根命名空间</param>
        /// <returns>直接子命名空间名称数组, 没有则返回空数组</returns>
        /// <remarks>该方法用来获取根命名空间时, 不包含空字符形式的命名空间</remarks>
        public static string[] GetChildNamespaces(this Assembly asm, string parentNmsp = "")
        {
            string head = parentNmsp == "" ? "" : @$"{parentNmsp}\.";
            Regex regTypeNamespace = new Regex($@"^(?<NS>{head}[\w]+)\.[\w.]+$");
            List<string> result = new();
            foreach (Type tp in asm.GetTypes())
            {
                string type_name = tp.FullName ?? "";
                if (regTypeNamespace.IsMatch(type_name))
                {
                    string childns = regTypeNamespace.Match(type_name).Groups["NS"].Value;
                    if (!result.Contains(childns))
                    {
                        result.Add(childns);
                    }
                }
            }
            return result.ToArray();
        }


        /// <summary>
        /// 获取程序集内, 指定命名空间下的类型(例如class,enum,record,struct等), 不包括子命名空间的
        /// </summary>
        /// <param name="asm">指定程序集</param>
        /// <param name="nmsp">指定命名空间</param>
        /// <returns>程序集内, 指定命名空间下的类型,没有则返回空数组</returns>
        /// <remarks>类型的获取, 内部依赖于Assembly.GetTypes方法. MSDN表述包含嵌套类型, 实测不包含</remarks>
        public static Type[] GetOwnTypes(this Assembly asm, string nmsp = "")
        {
            List<Type> result = new();
            string head = nmsp == "" ? "" : @$"{nmsp}\.";
            Regex regTypeNamespace = new Regex($@"^{head}[\w]+$");
            foreach (Type tp in asm.GetTypes())
            {
                string type_name = tp.FullName ?? "";
                if (regTypeNamespace.IsMatch(type_name))
                {
                    result.Add(tp);
                }
            }
            return result.ToArray();
        }
    }
}
