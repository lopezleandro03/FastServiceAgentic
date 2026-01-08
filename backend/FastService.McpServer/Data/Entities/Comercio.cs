using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Comercio
{
    public int ComercioId { get; set; }

    public string? Code { get; set; }

    public string? Descripcion { get; set; }

    public string? Contacto { get; set; }

    public string? Direccion { get; set; }

    public string? Localidad { get; set; }

    public string? Mail { get; set; }

    public string? Telefono { get; set; }

    public string? Telefono2 { get; set; }

    public string? Cuit { get; set; }

    public bool Activo { get; set; }

    public DateTime? ModificadoEn { get; set; }

    public int? ModificadoPor { get; set; }

    public virtual ICollection<Reparacion> Reparacions { get; set; } = new List<Reparacion>();
}
