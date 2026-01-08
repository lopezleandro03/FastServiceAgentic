using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class OldEstadoRep
{
    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string? Categoria { get; set; }

    public bool? Activo { get; set; }

    public string? ModificadoPor { get; set; }

    public DateTime? ModificadoEn { get; set; }
}
