using FastService.McpServer.Services;
using FastService.McpServer.Dtos;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace FastService.McpServer.Tools;

/// <summary>
/// MCP Tools for accounting and sales-related operations.
/// These tools enable external clients to query financial data.
/// </summary>
[McpServerToolType]
public class AccountingTools
{
    private readonly AccountingService _accountingService;
    private readonly ILogger<AccountingTools> _logger;

    public AccountingTools(AccountingService accountingService, ILogger<AccountingTools> logger)
    {
        _accountingService = accountingService;
        _logger = logger;
    }

    /// <summary>
    /// Get sales summary for all time periods.
    /// </summary>
    [McpServerTool(Name = "GetSalesSummary")]
    [Description("Get sales summary totals for today, this week, this month, and this year. Returns amounts with and without invoice.")]
    public async Task<string> GetSalesSummaryAsync()
    {
        try
        {
            _logger.LogInformation("Getting sales summary");

            var summary = await _accountingService.GetSalesSummaryAsync();

            return ToolResponseHelper.Success(new
            {
                Today = new
                {
                    WithInvoice = summary.Today.TotalWithInvoice,
                    WithoutInvoice = summary.Today.TotalWithoutInvoice,
                    Total = summary.Today.TotalWithInvoice + summary.Today.TotalWithoutInvoice
                },
                Week = new
                {
                    WithInvoice = summary.Week.TotalWithInvoice,
                    WithoutInvoice = summary.Week.TotalWithoutInvoice,
                    Total = summary.Week.TotalWithInvoice + summary.Week.TotalWithoutInvoice
                },
                Month = new
                {
                    WithInvoice = summary.Month.TotalWithInvoice,
                    WithoutInvoice = summary.Month.TotalWithoutInvoice,
                    Total = summary.Month.TotalWithInvoice + summary.Month.TotalWithoutInvoice
                },
                Year = new
                {
                    WithInvoice = summary.Year.TotalWithInvoice,
                    WithoutInvoice = summary.Year.TotalWithoutInvoice,
                    Total = summary.Year.TotalWithInvoice + summary.Year.TotalWithoutInvoice
                }
            }, "Sales summary retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales summary");
            return ToolResponseHelper.Error($"Error getting sales summary: {ex.Message}");
        }
    }

    /// <summary>
    /// Get sales data for a specific period.
    /// </summary>
    [McpServerTool(Name = "GetSalesForPeriod")]
    [Description("Get detailed sales chart data for a specific period (day, week, month, or year).")]
    public async Task<string> GetSalesForPeriodAsync(
        [Description("The period to get data for: 'd' for day (hourly), 'w' for week (daily), 'm' for month (daily), 'y' for year (monthly)")] string period,
        [Description("The year to query (defaults to current year)")] int? year = null,
        [Description("The month to query for monthly view, 1-12 (defaults to current month)")] int? month = null)
    {
        try
        {
            // Validate period
            var periodChar = period.ToLower().FirstOrDefault();
            if (periodChar != 'd' && periodChar != 'w' && periodChar != 'm' && periodChar != 'y')
            {
                return ToolResponseHelper.Error("Invalid period. Use 'd' (day), 'w' (week), 'm' (month), or 'y' (year)");
            }

            _logger.LogInformation("Getting sales for period: {Period}, year: {Year}, month: {Month}", period, year, month);

            var chartData = await _accountingService.GetSalesChartDataAsync(periodChar, year, month);

            // Calculate totals from the chart data
            decimal totalWithInvoice = 0;
            decimal totalWithoutInvoice = 0;

            if (chartData.Datasets.Count >= 2)
            {
                totalWithInvoice = chartData.Datasets[0].Data.Sum();
                totalWithoutInvoice = chartData.Datasets[1].Data.Sum();
            }

            return ToolResponseHelper.Success(new
            {
                Period = periodChar.ToString(),
                Year = year ?? DateTime.Now.Year,
                Month = month ?? DateTime.Now.Month,
                chartData.Labels,
                chartData.Datasets,
                Summary = new
                {
                    TotalWithInvoice = totalWithInvoice,
                    TotalWithoutInvoice = totalWithoutInvoice,
                    GrandTotal = totalWithInvoice + totalWithoutInvoice
                }
            }, $"Sales data for {GetPeriodDescription(periodChar)} retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales for period: {Period}", period);
            return ToolResponseHelper.Error($"Error getting sales data: {ex.Message}", new { period });
        }
    }

    /// <summary>
    /// Get sales breakdown by payment method.
    /// </summary>
    [McpServerTool(Name = "GetSalesByPaymentMethod")]
    [Description("Get sales breakdown by payment method for a date range.")]
    public async Task<string> GetSalesByPaymentMethodAsync(
        [Description("Start date in YYYY-MM-DD format (defaults to start of current month)")] string? startDate = null,
        [Description("End date in YYYY-MM-DD format (defaults to today)")] string? endDate = null)
    {
        try
        {
            DateTime start = string.IsNullOrEmpty(startDate) 
                ? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1)
                : DateTime.Parse(startDate);
            
            DateTime end = string.IsNullOrEmpty(endDate) 
                ? DateTime.Now 
                : DateTime.Parse(endDate);

            _logger.LogInformation("Getting sales by payment method from {Start} to {End}", start, end);

            // Use the movements API with all payment methods to calculate breakdown
            var filter = new SalesMovementFilter
            {
                StartDate = start,
                EndDate = end,
                Page = 1,
                PageSize = 10000 // Get all for aggregation
            };

            var movements = await _accountingService.GetSalesMovementsAsync(filter);

            // Group by payment method
            var byPaymentMethod = movements.Items
                .GroupBy(m => m.PaymentMethod)
                .Select(g => new
                {
                    PaymentMethod = g.Key,
                    Count = g.Count(),
                    TotalAmount = g.Sum(x => x.Amount),
                    WithInvoice = g.Where(x => !string.IsNullOrEmpty(x.InvoiceNumber)).Sum(x => x.Amount),
                    WithoutInvoice = g.Where(x => string.IsNullOrEmpty(x.InvoiceNumber)).Sum(x => x.Amount)
                })
                .OrderByDescending(x => x.TotalAmount)
                .ToList();

            return ToolResponseHelper.Success(new
            {
                StartDate = start.ToString("yyyy-MM-dd"),
                EndDate = end.ToString("yyyy-MM-dd"),
                TotalAmount = movements.TotalAmount,
                TotalWithInvoice = movements.TotalWithInvoice,
                TotalWithoutInvoice = movements.TotalWithoutInvoice,
                ByPaymentMethod = byPaymentMethod
            }, $"Sales by payment method from {start:yyyy-MM-dd} to {end:yyyy-MM-dd}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by payment method");
            return ToolResponseHelper.Error($"Error getting sales breakdown: {ex.Message}");
        }
    }

    /// <summary>
    /// Get recent sales transactions.
    /// </summary>
    [McpServerTool(Name = "GetRecentSales")]
    [Description("Get the most recent sales transactions.")]
    public async Task<string> GetRecentSalesAsync(
        [Description("Number of recent sales to return")] int count = 20,
        [Description("Filter by invoiced status: true for invoiced only, false for non-invoiced only, null for all")] bool? invoiced = null)
    {
        try
        {
            _logger.LogInformation("Getting {Count} recent sales, invoiced filter: {Invoiced}", count, invoiced);

            var filter = new SalesMovementFilter
            {
                StartDate = DateTime.Now.AddMonths(-3), // Last 3 months
                EndDate = DateTime.Now,
                Invoiced = invoiced,
                Page = 1,
                PageSize = count,
                SortBy = "fecha",
                SortDesc = true
            };

            var movements = await _accountingService.GetSalesMovementsAsync(filter);

            var sales = movements.Items.Select(m => new
            {
                m.VentaId,
                m.Date,
                m.ClientName,
                m.ClientLastname,
                CustomerFullName = $"{m.ClientName} {m.ClientLastname}".Trim(),
                m.Amount,
                m.PaymentMethod,
                m.Description,
                HasInvoice = !string.IsNullOrEmpty(m.InvoiceNumber),
                m.InvoiceNumber,
                m.Origin
            }).ToList();

            return ToolResponseHelper.SuccessWithCount(new
            {
                Sales = sales,
                TotalAmount = sales.Sum(s => s.Amount)
            }, sales.Count, $"Retrieved {sales.Count} recent sales");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent sales");
            return ToolResponseHelper.Error($"Error getting recent sales: {ex.Message}");
        }
    }

    private static string GetPeriodDescription(char period) => period switch
    {
        'd' => "today (hourly breakdown)",
        'w' => "this week (daily breakdown)",
        'm' => "this month (daily breakdown)",
        'y' => "this year (monthly breakdown)",
        _ => "the selected period"
    };
}
