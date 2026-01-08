using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Direccion
{
    public int DireccionId { get; set; }

    public string? Altura { get; set; }

    public string? Calle { get; set; }

    public string? Calle2 { get; set; }

    public string? Calle3 { get; set; }

    public string? Ciudad { get; set; }

    public string? Provincia { get; set; }

    public string? CodigoPostal { get; set; }

    public string? Pais { get; set; }

    public string? Comentarios { get; set; }

    public decimal? Latitud { get; set; }

    public decimal? Longitud { get; set; }

    public DateTime ChangedOn { get; set; }

    public int ChangedBy { get; set; }

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
}
