using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Cliente
{
    public int ClienteId { get; set; }

    public int? Dni { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string? Mail { get; set; }

    public string? Telefono1 { get; set; }

    public string? Telefono2 { get; set; }

    public string Direccion { get; set; } = null!;

    public int? DireccionId { get; set; }

    public string? Localidad { get; set; }

    public double? Latitud { get; set; }

    public double? Longitud { get; set; }

    public virtual Direccion? DireccionNavigation { get; set; }

    public virtual ICollection<Reparacion> Reparacions { get; set; } = new List<Reparacion>();

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
