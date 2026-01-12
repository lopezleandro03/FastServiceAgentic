namespace FastService.McpServer.Dtos;

/// <summary>
/// Individual sales movement/transaction
/// </summary>
public class SalesMovementDto
{
    public int VentaId { get; set; }
    public string Origin { get; set; } = string.Empty;
    public int? Dni { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientLastname { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? InvoiceNumber { get; set; }
    public DateTime Date { get; set; }
}

/// <summary>
/// Filter criteria for sales movements query
/// </summary>
public class SalesMovementFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? PaymentMethodId { get; set; }
    public bool? Invoiced { get; set; }
    public int? PointOfSaleId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string SortBy { get; set; } = "Date";
    public bool SortDesc { get; set; } = true;
}

/// <summary>
/// Paginated response for sales movements
/// </summary>
public class SalesMovementsResponse
{
    public List<SalesMovementDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    
    /// <summary>Total amount across all filtered movements (not just current page)</summary>
    public decimal TotalAmount { get; set; }
    
    /// <summary>Total amount with invoice across all filtered movements</summary>
    public decimal TotalWithInvoice { get; set; }
    
    /// <summary>Total amount without invoice across all filtered movements</summary>
    public decimal TotalWithoutInvoice { get; set; }
}
