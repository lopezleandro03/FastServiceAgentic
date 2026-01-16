namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for processing Archivar action (admin archives equipment to stock)
/// Used when equipment becomes shop property for spare parts
/// </summary>
public class ProcessArchivarRequest
{
    /// <summary>
    /// The order number to process
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// Required: The designated storage location for the equipment
    /// </summary>
    public string Ubicacion { get; set; } = string.Empty;

    /// <summary>
    /// Optional additional notes about the archival
    /// </summary>
    public string? Observacion { get; set; }

    /// <summary>
    /// The user ID performing the action
    /// </summary>
    public int? UserId { get; set; }
}

/// <summary>
/// Response DTO for Archivar action
/// </summary>
public class ProcessArchivarResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public int NovedadId { get; set; }
}
