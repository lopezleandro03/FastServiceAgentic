namespace FastService.McpServer.Dtos;

/// <summary>
/// Represents an order movement/comment (Novedad).
/// </summary>
public class OrderMovement
{
    public int MovementId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
