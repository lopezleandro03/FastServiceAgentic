namespace FastService.McpServer.Dtos;

/// <summary>
/// Represents a single order card within a Kanban column.
/// Matches baseline OrdenModel for compatibility.
/// </summary>
public class KanbanOrderCard
{
    /// <summary>
    /// ReparacionId (order number)
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// Customer name in "APELLIDO, NOMBRE" format (uppercase)
    /// </summary>
    public string CustomerName { get; set; } = string.Empty;

    /// <summary>
    /// Device summary: TYPE-BRAND-MODEL (e.g., "MONITOR-SAMSUNG-LS19D300")
    /// </summary>
    public string DeviceSummary { get; set; } = string.Empty;

    /// <summary>
    /// Assigned technician ID (for deterministic color coding)
    /// </summary>
    public int TechnicianId { get; set; }

    /// <summary>
    /// Technician name
    /// </summary>
    public string TechnicianName { get; set; } = string.Empty;

    /// <summary>
    /// Responsible employee name
    /// </summary>
    public string ResponsibleName { get; set; } = string.Empty;

    /// <summary>
    /// True if order is warranty service (shows "E" badge)
    /// </summary>
    public bool IsWarranty { get; set; }

    /// <summary>
    /// True if order is domicile service (shows home icon)
    /// </summary>
    public bool IsDomicile { get; set; }

    /// <summary>
    /// True if order status is "REINGRESADO" (shows red background #ffbebb in A_REPARAR column)
    /// </summary>
    public bool IsReentry { get; set; }

    /// <summary>
    /// Days since customer was notified (only for PRESUPUESTADO and REPARADO columns)
    /// </summary>
    public int? DaysSinceNotification { get; set; }

    /// <summary>
    /// Last modification timestamp (for sorting)
    /// </summary>
    public DateTime LastActivityDate { get; set; }
}
