using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class RoleMenu
{
    public int Id { get; set; }

    public int RolId { get; set; }

    public int ItemMenuId { get; set; }

    public virtual ItemMenu ItemMenu { get; set; } = null!;

    public virtual Role Rol { get; set; } = null!;
}
