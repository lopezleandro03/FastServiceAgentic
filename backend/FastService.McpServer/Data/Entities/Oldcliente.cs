using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Oldcliente
{
    public int? Nrocli { get; set; }

    public string? Nombre { get; set; }

    public string? Direcc { get; set; }

    public string? Ecalle1 { get; set; }

    public string? Ecalle2 { get; set; }

    public string? Localidad { get; set; }

    public int? Nroloc { get; set; }

    public string? Categoria { get; set; }

    public string Observ { get; set; } = null!;

    public string Telefono { get; set; } = null!;

    public string Vinopor { get; set; } = null!;
}
