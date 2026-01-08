using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Pago
{
    public int PagoId { get; set; }

    public int CompraId { get; set; }

    public decimal Monto { get; set; }

    public DateTime FechaDebito { get; set; }

    public DateTime FechaEmision { get; set; }

    public string? NroReferencia { get; set; }

    public string? Motivo { get; set; }

    public int TipoTransaccionId { get; set; }

    public int? FacturaId { get; set; }

    public int? CreadoPor { get; set; }

    public DateTime FechaCreacion { get; set; }

    public int MetodoDePagoId { get; set; }

    public virtual Compra Compra { get; set; } = null!;

    public virtual Factura? Factura { get; set; }

    public virtual MetodoPago MetodoDePago { get; set; } = null!;

    public virtual TipoTransaccion TipoTransaccion { get; set; } = null!;
}
