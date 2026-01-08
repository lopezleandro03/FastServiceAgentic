using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Oldtecnico
{
    public int? NroTec { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Activo { get; set; }
}
