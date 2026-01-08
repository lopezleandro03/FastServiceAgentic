using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Novedad
{
    public int NovedadId { get; set; }

    public int ReparacionId { get; set; }

    public int UserId { get; set; }

    public int TipoNovedadId { get; set; }

    public decimal? Monto { get; set; }

    public string? Observacion { get; set; }

    public DateTime ModificadoEn { get; set; }

    public int? ModificadoPor { get; set; }
}
