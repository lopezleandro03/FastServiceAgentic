namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for processing Armado action (technician assembled/packed equipment for pickup)
/// Used when rejected orders are prepared for customer pickup
/// </summary>
public class ProcessArmadoRequest
{
    /// <summary>
    /// The order number to process
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// Optional observation about the assembly/packaging
    /// </summary>
    public string? Observacion { get; set; }

    /// <summary>
    /// The user ID performing the action (required)
    /// </summary>
    public required int UserId { get; set; }
}

/// <summary>
/// Response DTO for Armado action
/// </summary>
public class ProcessArmadoResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public int NovedadId { get; set; }
}
