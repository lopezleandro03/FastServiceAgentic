using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class PuntoDeVentum
{
    public int PuntoDeVentaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
