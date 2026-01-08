using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Modelo
{
    public int DispositivoModeloId { get; set; }

    public int? MarcaId { get; set; }

    public int? TipoId { get; set; }

    public string? Modelo1 { get; set; }

    public string? Code { get; set; }

    public string? Descripcion { get; set; }

    public byte[]? Activo { get; set; }

    public DateTime? ModificadoEn { get; set; }

    public int? ModificadoPor { get; set; }
}
