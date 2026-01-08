using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class VwReparacionTiempo
{
    public int ReparacionId { get; set; }

    public int? DiasDesdeUltimaActividad { get; set; }
}
