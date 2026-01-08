using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class TipoFactura
{
    public int TipoFacturaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public DateTime ModificadoEn { get; set; }

    public int ModificadoPor { get; set; }

    public virtual ICollection<Factura> Facturas { get; set; } = new List<Factura>();
}
