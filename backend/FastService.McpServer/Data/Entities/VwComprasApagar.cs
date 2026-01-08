using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class VwComprasApagar
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

    public decimal Saldo { get; set; }
}
