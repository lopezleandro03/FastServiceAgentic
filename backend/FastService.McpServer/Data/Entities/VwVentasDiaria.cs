using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class VwVentasDiaria
{
    public decimal? Total { get; set; }

    public bool Facturado { get; set; }
}
