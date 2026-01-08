using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Usuario
{
    public int UserId { get; set; }

    public string Login { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Contraseña { get; set; } = null!;

    public string Direccion { get; set; } = null!;

    public string Telefono1 { get; set; } = null!;

    public string? Telefono2 { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Reparacion> ReparacionEmpleadoAsignados { get; set; } = new List<Reparacion>();

    public virtual ICollection<Reparacion> ReparacionTecnicoAsignados { get; set; } = new List<Reparacion>();
}
