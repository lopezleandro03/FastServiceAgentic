namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for processing a "Seña" (deposit/advance payment) action on an order
/// </summary>
public class ProcessSenaRequest
{
    /// <summary>
    /// The order number receiving the deposit
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// The deposit amount
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
    /// The user performing the action (required)
    /// </summary>
    public required int UserId { get; set; }
}

/// <summary>
/// Response DTO for Seña action
/// </summary>
public class ProcessSenaResponse
{
    public int OrderNumber { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public decimal MontoRegistrado { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public bool Facturado { get; set; }
    public int? VentaId { get; set; }
    public int NovedadId { get; set; }
    public DateTime ProcessedAt { get; set; }
}
