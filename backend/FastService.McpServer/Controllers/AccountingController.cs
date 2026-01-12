using FastService.McpServer.Dtos;
using FastService.McpServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace FastService.McpServer.Controllers;

/// <summary>
/// Controller for accounting operations - sales summaries, charts, and movements
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AccountingController : ControllerBase
{
    private readonly AccountingService _accountingService;

    public AccountingController(AccountingService accountingService)
    {
        _accountingService = accountingService;
    }

    /// <summary>
    /// Get sales summary for all time periods (today, week, month, year)
    /// </summary>
    [HttpGet("sales-summary")]
    public async Task<ActionResult<SalesSummaryDto>> GetSalesSummary()
    {
        try
        {
            var summary = await _accountingService.GetSalesSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving sales summary: {ex.Message}");
        }
    }

    /// <summary>
    /// Get sales chart data for a specific period
    /// </summary>
    /// <param name="period">d=today (hourly), w=week (daily), m=month (daily), y=year (monthly)</param>
    /// <param name="year">Optional year filter (defaults to current year)</param>
    /// <param name="month">Optional month filter for month view (1-12, defaults to current month)</param>
    [HttpGet("sales-chart")]
    public async Task<ActionResult<SalesChartDataDto>> GetSalesChart(
        [FromQuery] char period = 'm',
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        try
        {
            if (!new[] { 'd', 'w', 'm', 'y' }.Contains(period))
            {
                return BadRequest("Invalid period. Use 'd' (day), 'w' (week), 'm' (month), or 'y' (year)");
            }

            var chartData = await _accountingService.GetSalesChartDataAsync(period, year, month);
            return Ok(chartData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving sales chart data: {ex.Message}");
        }
    }

    /// <summary>
    /// Get paginated list of sales movements/transactions
    /// </summary>
    [HttpGet("sales-movements")]
    public async Task<ActionResult<SalesMovementsResponse>> GetSalesMovements([FromQuery] SalesMovementFilter filter)
    {
        try
        {
            var movements = await _accountingService.GetSalesMovementsAsync(filter);
            return Ok(movements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving sales movements: {ex.Message}");
        }
    }
}
