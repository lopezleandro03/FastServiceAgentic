using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Proveedor
{
    public string ProveedorId { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Mail { get; set; }

    public string? Contacto { get; set; }

    public string? Telefono1 { get; set; }

    public string? Telefono2 { get; set; }

    public string? Direccion { get; set; }

    public string? Localidad { get; set; }

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();
}
