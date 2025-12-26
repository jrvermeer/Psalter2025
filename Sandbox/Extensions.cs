using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Sandbox
{
    public static class Extensions
    {
        public static string TrimStart(this string s, string start)
        {
            if (s.StartsWith(start, StringComparison.OrdinalIgnoreCase))
                return s.Substring(start.Length);

            return s;
        }
    }
}
