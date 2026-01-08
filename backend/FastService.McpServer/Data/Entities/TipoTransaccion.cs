using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class TipoTransaccion
{
    public int TipoTransaccionId { get; set; }

    public string Nombre { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
