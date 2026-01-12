using FastService.McpServer.Data;
using FastService.McpServer.Dtos;
using Microsoft.EntityFrameworkCore;

namespace FastService.McpServer.Services;

/// <summary>
/// Service for accounting-related operations including sales summaries, charts, and movements
/// </summary>
public class AccountingService
{
    private readonly FastServiceDbContext _context;
    private static readonly string[] SpanishDayNames = { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };
    private static readonly string[] SpanishMonthNames = { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

    public AccountingService(FastServiceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get sales summary for all time periods (today, week, month, year)
    /// </summary>
    public async Task<SalesSummaryDto> GetSalesSummaryAsync()
    {
        var now = DateTime.Now;
        var today = now.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var startOfYear = new DateTime(now.Year, 1, 1);

        var sales = await _context.Venta
            .Where(v => v.Fecha >= startOfYear)
            .Select(v => new { v.Fecha, v.Monto, v.FacturaId })
            .ToListAsync();

        return new SalesSummaryDto
        {
            Today = CalculatePeriodSummary(sales, today, today.AddDays(1)),
            Week = CalculatePeriodSummary(sales, startOfWeek, startOfWeek.AddDays(7)),
            Month = CalculatePeriodSummary(sales, startOfMonth, startOfMonth.AddMonths(1)),
            Year = CalculatePeriodSummary(sales, startOfYear, startOfYear.AddYears(1))
        };
    }

    private PeriodSummaryDto CalculatePeriodSummary<T>(
        List<T> sales,
        DateTime start,
        DateTime end) where T : class
    {
        var periodSales = sales
            .Where(s => 
            {
                var fecha = (DateTime)s.GetType().GetProperty("Fecha")!.GetValue(s)!;
                return fecha >= start && fecha < end;
            })
            .ToList();

        decimal withInvoice = 0;
        decimal withoutInvoice = 0;

        foreach (var sale in periodSales)
        {
            var monto = (decimal)sale.GetType().GetProperty("Monto")!.GetValue(sale)!;
            var facturaId = sale.GetType().GetProperty("FacturaId")!.GetValue(sale);
            
            if (facturaId != null)
                withInvoice += monto;
            else
                withoutInvoice += monto;
        }

        return new PeriodSummaryDto
        {
            TotalWithInvoice = withInvoice,
            TotalWithoutInvoice = withoutInvoice
        };
    }

    /// <summary>
    /// Get chart data for a specific period
    /// </summary>
    /// <param name="period">d=day, w=week, m=month, y=year</param>
    /// <param name="year">Optional year (defaults to current year)</param>
    /// <param name="month">Optional month for month view (1-12, defaults to current month)</param>
    public async Task<SalesChartDataDto> GetSalesChartDataAsync(char period, int? year = null, int? month = null)
    {
        var now = DateTime.Now;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;
        
        // Determine the date range to query based on period and filters
        DateTime queryStart, queryEnd;
        
        if (period == 'y')
        {
            queryStart = new DateTime(targetYear, 1, 1);
            queryEnd = new DateTime(targetYear, 12, 31, 23, 59, 59);
        }
        else if (period == 'm')
        {
            queryStart = new DateTime(targetYear, targetMonth, 1);
            queryEnd = queryStart.AddMonths(1).AddSeconds(-1);
        }
        else
        {
            // For day and week, use current dates
            queryStart = new DateTime(now.Year, 1, 1);
            queryEnd = now;
        }

        var sales = await _context.Venta
            .Where(v => v.Fecha >= queryStart && v.Fecha <= queryEnd)
            .Select(v => new { v.Fecha, v.Monto, v.FacturaId })
            .ToListAsync();

        var result = new SalesChartDataDto { Period = period.ToString() };
        var withInvoiceData = new ChartDatasetDto { Label = "Con Factura" };
        var withoutInvoiceData = new ChartDatasetDto { Label = "Sin Factura" };

        switch (period)
        {
            case 'd':
                // Hourly data for today (6 AM to 10 PM)
                for (int hour = 6; hour <= 22; hour++)
                {
                    result.Labels.Add($"{hour}:00");
                    var hourStart = now.Date.AddHours(hour);
                    var hourEnd = hourStart.AddHours(1);
                    
                    var hourSales = sales.Where(s => s.Fecha >= hourStart && s.Fecha < hourEnd);
                    withInvoiceData.Data.Add(hourSales.Where(s => s.FacturaId != null).Sum(s => s.Monto));
                    withoutInvoiceData.Data.Add(hourSales.Where(s => s.FacturaId == null).Sum(s => s.Monto));
                }
                break;

            case 'w':
                // Daily data for current week
                var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);
                for (int day = 0; day < 7; day++)
                {
                    result.Labels.Add(SpanishDayNames[day]);
                    var dayStart = startOfWeek.AddDays(day);
                    var dayEnd = dayStart.AddDays(1);
                    
                    var daySales = sales.Where(s => s.Fecha >= dayStart && s.Fecha < dayEnd);
                    withInvoiceData.Data.Add(daySales.Where(s => s.FacturaId != null).Sum(s => s.Monto));
                    withoutInvoiceData.Data.Add(daySales.Where(s => s.FacturaId == null).Sum(s => s.Monto));
                }
                break;

            case 'm':
                // Daily data for selected month and year
                var daysInMonth = DateTime.DaysInMonth(targetYear, targetMonth);
                for (int day = 1; day <= daysInMonth; day++)
                {
                    result.Labels.Add(day.ToString());
                    var dayStart = new DateTime(targetYear, targetMonth, day);
                    var dayEnd = dayStart.AddDays(1);
                    
                    var daySales = sales.Where(s => s.Fecha >= dayStart && s.Fecha < dayEnd);
                    withInvoiceData.Data.Add(daySales.Where(s => s.FacturaId != null).Sum(s => s.Monto));
                    withoutInvoiceData.Data.Add(daySales.Where(s => s.FacturaId == null).Sum(s => s.Monto));
                }
                break;

            case 'y':
                // Monthly data for selected year
                for (int m = 1; m <= 12; m++)
                {
                    result.Labels.Add(SpanishMonthNames[m - 1]);
                    var monthStart = new DateTime(targetYear, m, 1);
                    var monthEnd = monthStart.AddMonths(1);
                    
                    var monthSales = sales.Where(s => s.Fecha >= monthStart && s.Fecha < monthEnd);
                    withInvoiceData.Data.Add(monthSales.Where(s => s.FacturaId != null).Sum(s => s.Monto));
                    withoutInvoiceData.Data.Add(monthSales.Where(s => s.FacturaId == null).Sum(s => s.Monto));
                }
                break;
        }

        result.Datasets.Add(withInvoiceData);
        result.Datasets.Add(withoutInvoiceData);
        return result;
    }

    /// <summary>
    /// Get paginated list of sales movements with filtering
    /// </summary>
    public async Task<SalesMovementsResponse> GetSalesMovementsAsync(SalesMovementFilter filter)
    {
        var query = _context.Venta
            .Include(v => v.Cliente)
            .Include(v => v.PuntoDeVenta)
            .Include(v => v.Factura)
            .AsQueryable();

        // Apply filters
        if (filter.StartDate.HasValue)
            query = query.Where(v => v.Fecha >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(v => v.Fecha <= filter.EndDate.Value);

        if (filter.PaymentMethodId.HasValue)
            query = query.Where(v => v.MetodoPagoId == filter.PaymentMethodId.Value);

        if (filter.Invoiced.HasValue)
        {
            if (filter.Invoiced.Value)
                query = query.Where(v => v.FacturaId != null);
            else
                query = query.Where(v => v.FacturaId == null);
        }

        if (filter.PointOfSaleId.HasValue)
            query = query.Where(v => v.PuntoDeVentaId == filter.PointOfSaleId.Value);

        // Get total count before pagination
        var totalCount = await query.CountAsync();
        
        // Calculate total amounts before pagination
        var totalAmount = await query.SumAsync(v => v.Monto);
        var totalWithInvoice = await query.Where(v => v.FacturaId != null).SumAsync(v => v.Monto);
        var totalWithoutInvoice = totalAmount - totalWithInvoice;

        // Apply sorting
        query = filter.SortBy?.ToLower() switch
        {
            "ventaid" or "id" => filter.SortDesc ? query.OrderByDescending(v => v.VentaId) : query.OrderBy(v => v.VentaId),
            "amount" or "monto" => filter.SortDesc ? query.OrderByDescending(v => v.Monto) : query.OrderBy(v => v.Monto),
            "clientname" => filter.SortDesc ? query.OrderByDescending(v => v.Cliente!.Nombre) : query.OrderBy(v => v.Cliente!.Nombre),
            _ => filter.SortDesc ? query.OrderByDescending(v => v.Fecha) : query.OrderBy(v => v.Fecha)
        };

        // Apply pagination
        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(v => new SalesMovementDto
            {
                VentaId = v.VentaId,
                Origin = v.PuntoDeVenta.Nombre ?? "Unknown",
                Dni = v.Cliente != null ? v.Cliente.Dni : null,
                ClientName = v.Cliente != null ? v.Cliente.Nombre ?? "" : "",
                ClientLastname = v.Cliente != null ? v.Cliente.Apellido ?? "" : "",
                Amount = v.Monto,
                Description = v.Descripcion,
                PaymentMethod = _context.MetodoPagos
                    .Where(m => m.MetodoPagoId == v.MetodoPagoId)
                    .Select(m => m.Nombre)
                    .FirstOrDefault() ?? "N/A",
                InvoiceNumber = v.Factura != null ? v.Factura.NroFactura : null,
                Date = v.Fecha
            })
            .ToListAsync();

        return new SalesMovementsResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalAmount = totalAmount,
            TotalWithInvoice = totalWithInvoice,
            TotalWithoutInvoice = totalWithoutInvoice
        };
    }
}
