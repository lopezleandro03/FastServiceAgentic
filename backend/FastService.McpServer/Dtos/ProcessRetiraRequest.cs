namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for processing a "Retira" (withdrawal) action on an order
/// </summary>
public class ProcessRetiraRequest
{
    /// <summary>
    /// The order number being withdrawn
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// The payment amount for the repair
    /// </summary>
    public decimal Monto { get; set; }

    /// <summary>
    /// The payment method ID (from MetodoPago table)
    /// </summary>
    public int MetodoPagoId { get; set; }

    /// <summary>
    /// Whether the payment is invoiced (facturado)
    /// </summary>
    public bool Facturado { get; set; }

    /// <summary>
    /// The invoice type ID (if facturado is true)
    /// </summary>
    public int? TipoFacturaId { get; set; }

    /// <summary>
    /// The invoice number (if facturado is true)
    /// </summary>
    public string? NroFactura { get; set; }

    /// <summary>
    /// The user performing the action
    /// </summary>
    public int? UserId { get; set; }
}

/// <summary>
/// Response DTO for Retira action
/// </summary>
public class ProcessRetiraResponse
{
    public int OrderNumber { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public decimal MontoRegistrado { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public bool Facturado { get; set; }
    public int? VentaId { get; set; }
    public DateTime ProcessedAt { get; set; }
}

/// <summary>
/// DTO for payment method dropdown
/// </summary>
public class MetodoPagoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
}
