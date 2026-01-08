using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Compra
{
    public int CompraId { get; set; }

    public string ProveedorId { get; set; } = null!;

    public decimal Monto { get; set; }

    public bool Facturado { get; set; }

    public string? Descripcion { get; set; }

    public int PuntoDeVentaId { get; set; }

    public int Estado { get; set; }

    public DateTime FechaCreacion { get; set; }

    public int CreadoPor { get; set; }

    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();

    public virtual Proveedor Proveedor { get; set; } = null!;

    public virtual PuntoDeVentum PuntoDeVenta { get; set; } = null!;
}
