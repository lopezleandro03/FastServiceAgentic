namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for informing presupuesto (quote) to customer
/// </summary>
public class InformarPresupuestoRequest
{
    /// <summary>
    /// Action to take: "acepta", "rechaza", or "confirma"
    /// </summary>
    public required string Accion { get; set; }
    
    /// <summary>
    /// Optional new presupuesto amount. If 0 or null, keeps current value.
    /// </summary>
    public decimal? Monto { get; set; }
    
    /// <summary>
    /// Optional observation/notes
    /// </summary>
    public string? Observacion { get; set; }
    
    /// <summary>
    /// User ID performing the action (required)
    /// </summary>
    public required int UserId { get; set; }
}

/// <summary>
/// Response DTO for informing presupuesto
/// </summary>
public class InformarPresupuestoResponse
{
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public decimal Presupuesto { get; set; }
    public int NovedadId { get; set; }
    public DateTime InformadoEn { get; set; }
}
