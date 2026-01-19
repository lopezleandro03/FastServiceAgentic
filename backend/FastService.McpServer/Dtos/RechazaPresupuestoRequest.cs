namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for processing client budget rejection (Rechaza Presupuesto)
/// This is when the CLIENT rejects the budget quote (different from technician rejection)
/// </summary>
public class RechazaPresupuestoRequest
{
    /// <summary>
    /// Optional observation about the rejection (e.g., "Very expensive", "Will look elsewhere")
    /// </summary>
    public string? Observacion { get; set; }
    
    /// <summary>
    /// User ID performing the action (required)
    /// </summary>
    public required int UserId { get; set; }
}

/// <summary>
/// Response DTO for Rechaza Presupuesto operation
/// </summary>
public class RechazaPresupuestoResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public int NovedadId { get; set; }
}
