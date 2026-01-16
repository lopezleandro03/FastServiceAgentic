namespace FastService.McpServer.Dtos;

/// <summary>
/// Response DTO for the /api/orders/kanban endpoint.
/// Contains 6 fixed columns with orders grouped by repair status.
/// </summary>
public class KanbanBoardData
{
    /// <summary>
    /// Fixed array of 7 Kanban columns in display order:
    /// INGRESADO, A_REPARAR, RECHAZO_PRESUP, PRESUPUESTADO, ESP_REPUESTO, REPARADO, RECHAZADO
    /// </summary>
    public List<KanbanColumn> Columns { get; set; } = new();

    /// <summary>
    /// Total count of orders across all columns
    /// </summary>
    public int TotalOrders { get; set; }

    /// <summary>
    /// Timestamp when the data was generated
    /// </summary>
    public DateTime GeneratedAt { get; set; }
}
