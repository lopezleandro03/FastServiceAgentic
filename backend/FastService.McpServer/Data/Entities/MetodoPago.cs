using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class MetodoPago
{
    public int MetodoPagoId { get; set; }

    public string? Nombre { get; set; }

    public string? Descripcion { get; set; }

    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();
}
