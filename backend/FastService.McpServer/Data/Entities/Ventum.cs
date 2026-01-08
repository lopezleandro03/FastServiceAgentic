using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Ventum
{
    public int VentaId { get; set; }

    public int? ClienteId { get; set; }

    public decimal Monto { get; set; }

    public bool Facturado { get; set; }

    public string? Descripcion { get; set; }

    public int? FacturaId { get; set; }

    public string? RefNumber { get; set; }

    public int PuntoDeVentaId { get; set; }

    public DateTime Fecha { get; set; }

    public int Vendedor { get; set; }

    public int? MetodoPagoId { get; set; }

    public int TipoTransaccionId { get; set; }

    public virtual Cliente? Cliente { get; set; }

    public virtual Factura? Factura { get; set; }

    public virtual PuntoDeVentum PuntoDeVenta { get; set; } = null!;

    public virtual TipoTransaccion TipoTransaccion { get; set; } = null!;
}
