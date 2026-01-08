using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class ItemMenu
{
    public int ItemMenuId { get; set; }

    public string Name { get; set; } = null!;

    public int Orden { get; set; }

    public bool Estado { get; set; }

    public int? ItemMenuPadreId { get; set; }

    public string? Controlador { get; set; }

    public string? Accion { get; set; }

    public string? Parametros { get; set; }

    public string? Icon { get; set; }
}
