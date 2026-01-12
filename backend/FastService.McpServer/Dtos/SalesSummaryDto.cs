namespace FastService.McpServer.Dtos;

/// <summary>
/// Sales summary for a specific time period
/// </summary>
public class PeriodSummaryDto
{
    public decimal TotalWithInvoice { get; set; }
    public decimal TotalWithoutInvoice { get; set; }
    public decimal Total => TotalWithInvoice + TotalWithoutInvoice;
}

/// <summary>
/// Complete sales summary across all time periods
/// </summary>
public class SalesSummaryDto
{
    public PeriodSummaryDto Today { get; set; } = new();
    public PeriodSummaryDto Week { get; set; } = new();
    public PeriodSummaryDto Month { get; set; } = new();
    public PeriodSummaryDto Year { get; set; } = new();
}
