namespace FastService.McpServer.Dtos;

/// <summary>
/// Context information about the currently selected order in the UI.
/// This is passed to the AI so it knows which order the user is viewing
/// and can perform actions without requiring the order number again.
/// </summary>
public class SelectedOrderContext
{
    public int OrderNumber { get; set; }
    public string? CustomerName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? DeviceBrand { get; set; }
    public string? DeviceType { get; set; }
    public string? DeviceModel { get; set; }
    public string? Status { get; set; }
    public decimal? Presupuesto { get; set; }
}
