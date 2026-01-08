using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class UsuarioRol
{
    public int RolId { get; set; }

    public int UserId { get; set; }

    public virtual Role Rol { get; set; } = null!;
}
