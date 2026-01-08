using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class ReparacionDetalle
{
    public int ReparacionDetalleId { get; set; }

    public bool EsGarantia { get; set; }

    public bool EsDomicilio { get; set; }

    public string? NroReferencia { get; set; }

    public DateTime? FechoCompra { get; set; }

    public string? NroFactura { get; set; }

    public decimal? Presupuesto { get; set; }

    public DateTime? PresupuestoFecha { get; set; }

    public decimal? Precio { get; set; }

    public string? Modelo { get; set; }

    public string? Serie { get; set; }

    public string? Serbus { get; set; }

    public string? Unicacion { get; set; }

    public string? Accesorios { get; set; }

    public string? ReparacionDesc { get; set; }

    public DateTime ModificadoEn { get; set; }

    public int ModificadoPor { get; set; }

    public virtual ICollection<Reparacion> Reparacions { get; set; } = new List<Reparacion>();
}
