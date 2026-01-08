using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Oldobserv
{
    public int? Transac { get; set; }

    public int? Local { get; set; }

    public string? Observ { get; set; }

    public int? Creado { get; set; }
}
