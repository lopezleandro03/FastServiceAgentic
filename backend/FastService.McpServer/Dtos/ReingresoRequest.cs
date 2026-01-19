namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for reingreso (equipment re-entry)
/// </summary>
public class ReingresoRequest
{
    /// <summary>
    /// Required observation explaining the reason for reingreso
    /// </summary>
    public required string Observacion { get; set; }
    
    /// <summary>
    /// User ID performing the action (required)
    /// </summary>
    public required int UserId { get; set; }
}

/// <summary>
/// Response DTO for reingreso
/// </summary>
public class ReingresoResponse
{
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public int NovedadId { get; set; }
    public string Observacion { get; set; } = string.Empty;
}
