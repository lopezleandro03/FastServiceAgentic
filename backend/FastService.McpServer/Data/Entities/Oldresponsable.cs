using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Oldresponsable
{
    public int? NroRes { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Activo { get; set; }
}
