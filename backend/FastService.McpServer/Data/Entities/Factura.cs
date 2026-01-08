using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Factura
{
    public int FacturaId { get; set; }

    public int TipoFacturaId { get; set; }

    public string NroFactura { get; set; } = null!;

    public byte[]? Media { get; set; }

    public DateTime ModificadoEn { get; set; }

    public int ModificadoPor { get; set; }

    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();

    public virtual TipoFactura TipoFactura { get; set; } = null!;

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
