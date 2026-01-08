using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Role
{
    public int RolId { get; set; }

    public string Status { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public string? DefaultController { get; set; }

    public string? DefaultAction { get; set; }
}
