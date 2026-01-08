using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Marca
{
    public int MarcaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public bool Activo { get; set; }

    public DateTime? ModificadoEn { get; set; }

    public int? ModificadoPor { get; set; }

    public virtual ICollection<Reparacion> Reparacions { get; set; } = new List<Reparacion>();
}
