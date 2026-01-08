using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Oldcaja
{
    public DateTime? Fecha { get; set; }

    public int? Transac { get; set; }

    public int? Sucur { get; set; }

    public int? Nrocomp { get; set; }

    public int? Tipo { get; set; }

    public string? Concepto { get; set; }

    public int? Nrocue { get; set; }

    public decimal? Entrada { get; set; }

    public decimal? Salida { get; set; }

    public decimal? Otro { get; set; }

    public string? Cond { get; set; }

    public string? Estado { get; set; }

    public string? Cerrada { get; set; }

    public int? Poriva { get; set; }
}
