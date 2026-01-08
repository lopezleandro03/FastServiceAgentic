namespace FastService.McpServer.Dtos;

/// <summary>
/// Represents a single Kanban column with orders.
/// </summary>
public class KanbanColumn
{
    /// <summary>
    /// Column identifier matching baseline status grouping.
    /// Values: INGRESADO, PRESUPUESTADO, ESP_REPUESTO, A_REPARAR, REPARADO, RECHAZADO
    /// </summary>
    public string ColumnId { get; set; } = string.Empty;

    /// <summary>
    /// Display name shown in column header (e.g., "ESP. REPUESTO" for ESP_REPUESTO)
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Number of orders in this column (total count, may exceed displayed orders)
    /// </summary>
    public int OrderCount { get; set; }

    /// <summary>
    /// Orders in this column (max 50 per column, sorted by order number DESC)
    /// </summary>
    public List<KanbanOrderCard> Orders { get; set; } = new();
}
