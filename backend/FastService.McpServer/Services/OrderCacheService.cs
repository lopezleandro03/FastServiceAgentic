using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Dtos;

namespace FastService.McpServer.Services;

/// <summary>
/// Caches the last 100 orders (by ReparacionId) with their movements (Novedades) on startup.
/// Acts as the primary lookup source; falls back to DB for cache misses.
/// </summary>
public class OrderCacheService : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrderCacheService> _logger;

    // Thread-safe dictionary keyed by order number (ReparacionId)
    private readonly ConcurrentDictionary<int, CachedOrder> _orderCache = new();

    // Store the set of order IDs we pre-loaded so we know what's "warm"
    private HashSet<int> _preloadedOrderIds = new();

    public OrderCacheService(IServiceScopeFactory scopeFactory, ILogger<OrderCacheService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Start warm-up in background - don't block app startup
        _ = Task.Run(() => WarmUpCacheAsync(cancellationToken), cancellationToken);
        return Task.CompletedTask;
    }

    private async Task WarmUpCacheAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("OrderCacheService: Starting warm-up of last 100 orders...");
        var sw = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FastServiceDbContext>();

            // Load last 100 orders by descending ReparacionId (most recent)
            var recentOrders = await context.Reparacions
                .AsNoTracking()
                .Include(r => r.Cliente)
                .Include(r => r.Marca)
                .Include(r => r.TipoDispositivo)
                .Include(r => r.EstadoReparacion)
                .Include(r => r.TecnicoAsignado)
                .Include(r => r.ReparacionDetalle)
                .OrderByDescending(r => r.ReparacionId)
                .Take(100)
                .ToListAsync(cancellationToken);

            var orderIds = recentOrders.Select(r => r.ReparacionId).ToList();

            // Load tipo novedad lookup for descriptions (small table, load once)
            var tipoNovedadLookup = await context.TipoNovedads
                .AsNoTracking()
                .ToDictionaryAsync(t => t.TipoNovedadId, t => t.Nombre, cancellationToken);

            // Load all users for lookup (small table, load once)
            var allUsersLookup = await context.Usuarios
                .AsNoTracking()
                .ToDictionaryAsync(u => u.UserId, u => $"{u.Nombre} {u.Apellido}".Trim(), cancellationToken);

            // Load novedades individually per order (avoids OPENJSON issue on older SQL Server)
            var novedadesByOrder = new Dictionary<int, List<Data.Entities.Novedad>>();
            foreach (var orderId in orderIds)
            {
                if (cancellationToken.IsCancellationRequested) break;
                
                var orderNovedades = await context.Novedads
                    .AsNoTracking()
                    .Where(n => n.ReparacionId == orderId)
                    .OrderBy(n => n.ModificadoEn)
                    .ToListAsync(cancellationToken);
                novedadesByOrder[orderId] = orderNovedades;
            }

            // Build cache entries
            var totalMovements = 0;
            foreach (var order in recentOrders)
            {
                var orderNovedades = novedadesByOrder.GetValueOrDefault(order.ReparacionId) ?? new List<Data.Entities.Novedad>();
                totalMovements += orderNovedades.Count;

                var movements = orderNovedades.Select(n => new OrderMovement
                {
                    MovementId = n.NovedadId,
                    Type = tipoNovedadLookup.GetValueOrDefault(n.TipoNovedadId, "Desconocido"),
                    Description = n.Observacion ?? string.Empty,
                    Amount = n.Monto,
                    CreatedBy = allUsersLookup.GetValueOrDefault(n.UserId, "Usuario"),
                    CreatedAt = n.ModificadoEn
                }).ToList();

                var cachedOrder = new CachedOrder
                {
                    OrderDetails = MapToOrderDetails(order),
                    Movements = movements,
                    CachedAt = DateTime.UtcNow
                };

                _orderCache[order.ReparacionId] = cachedOrder;
            }

            _preloadedOrderIds = new HashSet<int>(orderIds);
            sw.Stop();

            _logger.LogInformation(
                "OrderCacheService: Warm-up complete. Loaded {Count} orders with {MovementCount} total movements in {Elapsed}ms",
                _orderCache.Count,
                totalMovements,
                sw.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("OrderCacheService: Warm-up was cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OrderCacheService: Error during warm-up");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("OrderCacheService: Stopping...");
        return Task.CompletedTask;
    }

    /// <summary>
    /// Try to get order details from the pre-loaded cache.
    /// Returns null if not in cache (caller should fall back to DB).
    /// </summary>
    public CachedOrder? TryGetFromCache(int orderNumber)
    {
        if (_orderCache.TryGetValue(orderNumber, out var cached))
        {
            _logger.LogDebug("OrderCacheService: Cache HIT for order {OrderNumber}", orderNumber);
            return cached;
        }

        _logger.LogDebug("OrderCacheService: Cache MISS for order {OrderNumber}", orderNumber);
        return null;
    }

    /// <summary>
    /// Check if an order was part of the initial pre-load.
    /// </summary>
    public bool IsPreloaded(int orderNumber) => _preloadedOrderIds.Contains(orderNumber);

    /// <summary>
    /// Add or update an order in the cache (e.g., after fetching from DB).
    /// </summary>
    public void AddOrUpdate(int orderNumber, CachedOrder cachedOrder)
    {
        _orderCache[orderNumber] = cachedOrder;
        _logger.LogDebug("OrderCacheService: Added/updated order {OrderNumber} in cache", orderNumber);
    }

    /// <summary>
    /// Invalidate a specific order (e.g., after an update).
    /// </summary>
    public void Invalidate(int orderNumber)
    {
        _orderCache.TryRemove(orderNumber, out _);
        _logger.LogDebug("OrderCacheService: Invalidated order {OrderNumber}", orderNumber);
    }

    private static OrderDetails MapToOrderDetails(Data.Entities.Reparacion r)
    {
        return new OrderDetails
        {
            OrderNumber = r.ReparacionId,
            Customer = new CustomerInfo
            {
                CustomerId = r.ClienteId,
                FullName = r.Cliente != null ? $"{r.Cliente.Nombre} {r.Cliente.Apellido}" : string.Empty,
                DNI = r.Cliente?.Dni?.ToString(),
                Email = r.Cliente?.Mail,
                Phone = r.Cliente?.Telefono1,
                Address = r.Cliente?.Direccion
            },
            Device = new DeviceInfo
            {
                Brand = r.Marca?.Nombre ?? string.Empty,
                DeviceType = r.TipoDispositivo?.Nombre ?? string.Empty,
                SerialNumber = r.ReparacionDetalle?.Serie
            },
            Repair = new RepairInfo
            {
                Status = r.EstadoReparacion?.Nombre ?? string.Empty,
                Observations = r.ReparacionDetalle?.ReparacionDesc,
                EntryDate = r.CreadoEn.ToString("yyyy-MM-dd"),
                ExitDate = r.FechaEntrega?.ToString("yyyy-MM-dd"),
                EstimatedDeliveryDate = r.FechaEntrega?.ToString("yyyy-MM-dd"),
                EstimatedPrice = r.ReparacionDetalle?.Presupuesto,
                FinalPrice = r.ReparacionDetalle?.Precio,
                UnderWarranty = r.ReparacionDetalle?.EsGarantia ?? false
            },
            Technician = new UserInfo
            {
                UserId = r.TecnicoAsignadoId,
                FullName = r.TecnicoAsignado != null ? $"{r.TecnicoAsignado.Nombre} {r.TecnicoAsignado.Apellido}".Trim() : string.Empty,
                Email = r.TecnicoAsignado?.Email,
                Phone = r.TecnicoAsignado?.Telefono1
            },
            Details = new List<RepairDetailInfo>()
        };
    }
}

/// <summary>
/// Represents a cached order with its movements/comments.
/// </summary>
public class CachedOrder
{
    public required OrderDetails OrderDetails { get; set; }
    public List<OrderMovement> Movements { get; set; } = new();
    public DateTime CachedAt { get; set; }
}

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
