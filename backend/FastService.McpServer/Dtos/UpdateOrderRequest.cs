namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for updating an existing repair order
/// </summary>
public class UpdateOrderRequest
{
    public int OrderNumber { get; set; }
    public CustomerData Customer { get; set; } = new();
    public DeviceData Device { get; set; } = new();
    public ComercioData Comercio { get; set; } = new();
    public bool Garantia { get; set; }
    public bool Domicilio { get; set; }
    public string? Presupuesto { get; set; }
    public string? MontoFinal { get; set; }
    public int ResponsableId { get; set; }
    public int TecnicoId { get; set; }
    public string? FechaCompra { get; set; }
}
