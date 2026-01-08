using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Reparacion
{
    public int ReparacionId { get; set; }

    public int ClienteId { get; set; }

    public int EmpleadoAsignadoId { get; set; }

    public int TecnicoAsignadoId { get; set; }

    public int EstadoReparacionId { get; set; }

    public int? ComercioId { get; set; }

    public int MarcaId { get; set; }

    public int TipoDispositivoId { get; set; }

    public int? ReparacionDetalleId { get; set; }

    public DateTime? FechaEntrega { get; set; }

    public DateTime? InformadoEn { get; set; }

    public int? InformadoPor { get; set; }

    public DateTime ModificadoEn { get; set; }

    public int? ModificadoPor { get; set; }

    public DateTime CreadoEn { get; set; }

    public int? CreadoPor { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Comercio? Comercio { get; set; }

    public virtual Usuario EmpleadoAsignado { get; set; } = null!;

    public virtual EstadoReparacion EstadoReparacion { get; set; } = null!;

    public virtual Marca Marca { get; set; } = null!;

    public virtual ReparacionDetalle? ReparacionDetalle { get; set; }

    public virtual Usuario TecnicoAsignado { get; set; } = null!;

    public virtual TipoDispositivo TipoDispositivo { get; set; } = null!;
}
