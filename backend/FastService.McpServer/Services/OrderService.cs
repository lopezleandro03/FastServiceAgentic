using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;

namespace FastService.McpServer.Services
{
    public class OrderService
    {
        private readonly FastServiceDbContext _context;
        private readonly ILogger<OrderService> _logger;
        private readonly IMemoryCache _cache;
        private readonly OrderCacheService _orderCacheService;
        // Compiled query to avoid lambda compilation overhead on first run
        private static readonly Func<FastServiceDbContext, int, System.Threading.Tasks.Task<ProjectedOrder?>> _compiledOrderQuery
            = EF.CompileAsyncQuery((FastServiceDbContext ctx, int orderNumber) =>
                ctx.Reparacions
                   .AsNoTracking()
                   .Where(r => r.ReparacionId == orderNumber)
                   .Select(r => new ProjectedOrder
                   {
                       ReparacionId = r.ReparacionId,
                       ClienteId = r.ClienteId,
                       ClienteNombre = r.Cliente!.Nombre,
                       ClienteApellido = r.Cliente.Apellido,
                       ClienteDni = r.Cliente.Dni,
                       ClienteMail = r.Cliente.Mail,
                       ClienteTelefono1 = r.Cliente.Telefono1,
                       ClienteTelefono2 = r.Cliente.Telefono2,
                       ClienteDireccion = r.Cliente.Direccion,
                       // Direccion structured fields
                       DireccionCalle = r.Cliente.DireccionNavigation != null ? r.Cliente.DireccionNavigation.Calle : null,
                       DireccionAltura = r.Cliente.DireccionNavigation != null ? r.Cliente.DireccionNavigation.Altura : null,
                       DireccionCalle2 = r.Cliente.DireccionNavigation != null ? r.Cliente.DireccionNavigation.Calle2 : null,
                       DireccionCalle3 = r.Cliente.DireccionNavigation != null ? r.Cliente.DireccionNavigation.Calle3 : null,
                       DireccionCiudad = r.Cliente.DireccionNavigation != null ? r.Cliente.DireccionNavigation.Ciudad : null,
                       DireccionCodigoPostal = r.Cliente.DireccionNavigation != null ? r.Cliente.DireccionNavigation.CodigoPostal : null,
                       MarcaNombre = r.Marca!.Nombre,
                       TipoDispositivoNombre = r.TipoDispositivo!.Nombre,
                       EstadoNombre = r.EstadoReparacion!.Nombre,
                       // ReparacionDetalle fields
                       DetalleModelo = r.ReparacionDetalle != null ? r.ReparacionDetalle.Modelo : null,
                       DetalleSerie = r.ReparacionDetalle != null ? r.ReparacionDetalle.Serie : null,
                       DetalleUbicacion = r.ReparacionDetalle != null ? r.ReparacionDetalle.Unicacion : null,
                       DetalleAccesorios = r.ReparacionDetalle != null ? r.ReparacionDetalle.Accesorios : null,
                       EsGarantia = r.ReparacionDetalle != null && r.ReparacionDetalle.EsGarantia,
                       EsDomicilio = r.ReparacionDetalle != null && r.ReparacionDetalle.EsDomicilio,
                       Presupuesto = r.ReparacionDetalle != null ? r.ReparacionDetalle.Presupuesto : null,
                       Precio = r.ReparacionDetalle != null ? r.ReparacionDetalle.Precio : null,
                       // Technician
                       TecnicoId = r.TecnicoAsignadoId,
                       TecnicoNombre = r.TecnicoAsignado!.Nombre,
                       TecnicoApellido = r.TecnicoAsignado.Apellido,
                       TecnicoEmail = r.TecnicoAsignado.Email,
                       TecnicoTelefono = r.TecnicoAsignado.Telefono1,
                       // Responsable (EmpleadoAsignado)
                       ResponsableId = r.EmpleadoAsignadoId,
                       ResponsableNombre = r.EmpleadoAsignado != null ? r.EmpleadoAsignado.Nombre : null,
                       ResponsableApellido = r.EmpleadoAsignado != null ? r.EmpleadoAsignado.Apellido : null,
                       ResponsableEmail = r.EmpleadoAsignado != null ? r.EmpleadoAsignado.Email : null,
                       ResponsableTelefono = r.EmpleadoAsignado != null ? r.EmpleadoAsignado.Telefono1 : null,
                       // Dates
                       CreadoEn = r.CreadoEn,
                       ModificadoEn = r.ModificadoEn,
                       FechaEntrega = r.FechaEntrega
                   }).FirstOrDefault());

        public OrderService(FastServiceDbContext context, ILogger<OrderService> logger, IMemoryCache cache, OrderCacheService orderCacheService)
        {
            _context = context;
            _logger = logger;
            _cache = cache;
            _orderCacheService = orderCacheService;
        }

        public async Task<List<OrderSummary>> SearchOrdersAsync(OrderSearchCriteria criteria)
        {
            try
            {
                var query = _context.Reparacions
                    .Include(r => r.Cliente)
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.Marca)
                    .Include(r => r.TipoDispositivo)
                    .Include(r => r.TecnicoAsignado)
                    .AsQueryable();

                // Apply filters
                if (criteria.OrderNumber.HasValue)
                {
                    query = query.Where(r => r.ReparacionId == criteria.OrderNumber.Value);
                }

                if (!string.IsNullOrWhiteSpace(criteria.CustomerName))
                {
                    var searchTerm = criteria.CustomerName.ToLower();
                    query = query.Where(r =>
                        r.Cliente!.Nombre.ToLower().Contains(searchTerm) ||
                        r.Cliente.Apellido.ToLower().Contains(searchTerm));
                }

                if (!string.IsNullOrWhiteSpace(criteria.DNI))
                {
                    if (int.TryParse(criteria.DNI, out var dniValue))
                    {
                        query = query.Where(r => r.Cliente!.Dni == dniValue);
                    }
                }

                if (!string.IsNullOrWhiteSpace(criteria.Status))
                {
                    query = query.Where(r => r.EstadoReparacion!.Nombre.ToLower().Contains(criteria.Status.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(criteria.Brand))
                {
                    query = query.Where(r => r.Marca!.Nombre.ToLower().Contains(criteria.Brand.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(criteria.DeviceType))
                {
                    query = query.Where(r => r.TipoDispositivo!.Nombre.ToLower().Contains(criteria.DeviceType.ToLower()));
                }

                if (criteria.FromDate.HasValue)
                {
                    query = query.Where(r => r.CreadoEn >= criteria.FromDate.Value);
                }

                if (criteria.ToDate.HasValue)
                {
                    query = query.Where(r => r.CreadoEn <= criteria.ToDate.Value);
                }

                // Limit results
                var results = await query
                    .OrderByDescending(r => r.CreadoEn)
                    .Take(criteria.MaxResults)
                    .Select(r => new OrderSummary
                    {
                        OrderNumber = r.ReparacionId,
                        CustomerName = $"{r.Cliente!.Nombre} {r.Cliente.Apellido}",
                        DeviceInfo = $"{r.Marca!.Nombre} {r.TipoDispositivo!.Nombre}",
                        Status = r.EstadoReparacion!.Nombre,
                        EntryDate = r.CreadoEn,
                        EstimatedDeliveryDate = r.FechaEntrega,
                        EstimatedPrice = null // Not available in current schema
                    })
                    .ToListAsync();

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching orders with criteria: {@Criteria}", criteria);
                throw;
            }
        }

        public async Task<OrderDetails?> GetOrderDetailsAsync(int orderNumber)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            // 1. Check pre-loaded startup cache first (last 100 orders with movements)
            var cachedOrder = _orderCacheService.TryGetFromCache(orderNumber);
            if (cachedOrder != null)
            {
                sw.Stop();
                _logger.LogInformation("GetOrderDetails: order {OrderNumber} returned from startup cache in {Elapsed}ms", orderNumber, sw.ElapsedMilliseconds);
                return cachedOrder.OrderDetails;
            }

            // 2. Check short-lived memory cache (for recently accessed orders not in startup cache)
            var cacheKey = $"order:{orderNumber}";
            if (_cache.TryGetValue(cacheKey, out var cachedObj))
            {
                if (cachedObj is OrderDetails cachedDetails)
                {
                    sw.Stop();
                    _logger.LogInformation("GetOrderDetails: order {OrderNumber} returned from memory cache in {Elapsed}ms", orderNumber, sw.ElapsedMilliseconds);
                    return cachedDetails;
                }
            }
            try
            {
                // Execute compiled query to avoid EF expression compilation cost
                var projected = await _compiledOrderQuery(_context, orderNumber);

                sw.Stop();
                if (projected == null)
                {
                    _logger.LogInformation("GetOrderDetails: order {OrderNumber} not found (db elapsed {Elapsed}ms)", orderNumber, sw.ElapsedMilliseconds);
                    return null;
                }

                _logger.LogInformation("GetOrderDetails: order {OrderNumber} db projection elapsed {Elapsed}ms", orderNumber, sw.ElapsedMilliseconds);

                // Fetch Novedades for this order
                var novedades = await GetNovedadesForOrderAsync(orderNumber);

                // Map projection to DTO
                var result = new OrderDetails
                {
                    OrderNumber = projected.ReparacionId,
                    Status = projected.EstadoNombre,
                    StatusDate = projected.ModificadoEn,
                    Presupuesto = projected.Presupuesto,
                    MontoFinal = projected.Precio,
                    IsDomicilio = projected.EsDomicilio,
                    IsGarantia = projected.EsGarantia,
                    EntryDate = projected.CreadoEn,
                    Customer = new CustomerInfo
                    {
                        CustomerId = projected.ClienteId ?? 0,
                        FirstName = projected.ClienteNombre,
                        LastName = projected.ClienteApellido,
                        FullName = $"{projected.ClienteNombre} {projected.ClienteApellido}",
                        DNI = projected.ClienteDni?.ToString(),
                        Email = projected.ClienteMail,
                        Phone = projected.ClienteTelefono1,
                        Celular = projected.ClienteTelefono2,
                        Address = projected.ClienteDireccion,
                        AddressDetails = new AddressInfo
                        {
                            FullAddress = projected.ClienteDireccion,
                            Calle = projected.DireccionCalle,
                            Altura = projected.DireccionAltura,
                            EntreCalle1 = projected.DireccionCalle2,
                            EntreCalle2 = projected.DireccionCalle3,
                            Ciudad = projected.DireccionCiudad,
                            CodigoPostal = projected.DireccionCodigoPostal
                        }
                    },
                    Device = new DeviceInfo
                    {
                        Brand = projected.MarcaNombre,
                        DeviceType = projected.TipoDispositivoNombre,
                        SerialNumber = projected.DetalleSerie,
                        Model = projected.DetalleModelo,
                        Ubicacion = projected.DetalleUbicacion,
                        Accesorios = projected.DetalleAccesorios
                    },
                    Repair = new RepairInfo
                    {
                        Status = projected.EstadoNombre,
                        Observations = null,
                        EntryDate = projected.CreadoEn.ToString("yyyy-MM-dd"),
                        ExitDate = projected.FechaEntrega?.ToString("yyyy-MM-dd"),
                        EstimatedDeliveryDate = projected.FechaEntrega?.ToString("yyyy-MM-dd"),
                        EstimatedPrice = projected.Presupuesto,
                        FinalPrice = projected.Precio,
                        UnderWarranty = projected.EsGarantia
                    },
                    Responsable = projected.ResponsableId.HasValue ? new UserInfo
                    {
                        UserId = projected.ResponsableId.Value,
                        FullName = $"{projected.ResponsableNombre} {projected.ResponsableApellido}".Trim(),
                        Email = projected.ResponsableEmail,
                        Phone = projected.ResponsableTelefono
                    } : null,
                    Technician = new UserInfo
                    {
                        UserId = projected.TecnicoId ?? 0,
                        FullName = $"{projected.TecnicoNombre} {projected.TecnicoApellido}".Trim(),
                        Email = projected.TecnicoEmail,
                        Phone = projected.TecnicoTelefono
                    },
                    Details = new List<RepairDetailInfo>(),
                    Novedades = novedades
                };
                _logger.LogInformation("GetOrderDetails: order {OrderNumber} mapped elapsed {Elapsed}ms (total)", orderNumber, sw.ElapsedMilliseconds);

                // Cache successful lookups for a short period to reduce DB pressure on hot items
                var cacheEntryOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
                };
                _cache.Set(cacheKey, result, cacheEntryOptions);
                return result;
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogError(ex, "Error getting order details for order: {OrderNumber} (elapsed {Elapsed}ms)", orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Get Novedades (order history events) for a specific order
        /// </summary>
        private async Task<List<NovedadInfo>> GetNovedadesForOrderAsync(int orderNumber)
        {
            try
            {
                // First get raw novedades
                var novedadesRaw = await _context.Novedads
                    .AsNoTracking()
                    .Where(n => n.ReparacionId == orderNumber)
                    .OrderByDescending(n => n.ModificadoEn)
                    .ToListAsync();

                if (!novedadesRaw.Any())
                    return new List<NovedadInfo>();

                // Get tipo novedad lookup
                var tipoIds = novedadesRaw.Select(n => n.TipoNovedadId).Distinct().ToList();
                var tipoNovedadLookup = await _context.TipoNovedads
                    .AsNoTracking()
                    .Where(t => tipoIds.Contains(t.TipoNovedadId))
                    .ToDictionaryAsync(t => t.TipoNovedadId, t => t.Nombre);

                // Map to DTOs
                var novedades = novedadesRaw.Select(n => new NovedadInfo
                {
                    Id = n.NovedadId,
                    Fecha = n.ModificadoEn,
                    Tipo = tipoNovedadLookup.GetValueOrDefault(n.TipoNovedadId, "Desconocido"),
                    Monto = n.Monto,
                    Observacion = n.Observacion,
                    UsuarioId = n.UserId
                }).ToList();

                return novedades;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting novedades for order: {OrderNumber}", orderNumber);
                return new List<NovedadInfo>();
            }
        }

        public async Task<List<OrderStatus>> GetAllStatusesAsync()
        {
            try
            {
                return await _context.EstadoReparacions
                    .Where(e => e.Activo == true)
                    .Select(e => new OrderStatus
                    {
                        StatusId = e.EstadoReparacionId,
                        Name = e.Nombre,
                        Description = e.Descripcion,
                        IsActive = e.Activo ?? false
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all statuses");
                throw;
            }
        }

        /// <summary>
        /// Get Kanban board data with orders grouped by repair status.
        /// Returns 6 fixed columns: INGRESADO, PRESUPUESTADO, ESP_REPUESTO, A_REPARAR, REPARADO, RECHAZADO
        /// </summary>
        public async Task<KanbanBoardData> GetKanbanBoardAsync(
            int? technicianId = null,
            int? responsibleId = null,
            int? businessId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            // Default date range: last 100 days (matching baseline)
            var desde = fromDate ?? DateTime.Now.AddDays(-100);
            var hasta = toDate ?? DateTime.Now.AddDays(1); // Include today

            // Column definitions with status mappings (baseline compatible)
            var columnDefinitions = new[]
            {
                ("INGRESADO", "INGRESADO", new[] { "INGRESADO" }),
                ("PRESUPUESTADO", "PRESUPUESTADO", new[] { "PRESUPUESTADO" }),
                ("ESP_REPUESTO", "ESP. REPUESTO", new[] { "ESP. REPUESTO" }),
                ("A_REPARAR", "A REPARAR", new[] { "A REPARAR", "REINGRESADO" }), // Merged column
                ("REPARADO", "REPARADO", new[] { "REPARADO" }),
                ("RECHAZADO", "RECHAZADO", new[] { "RECHAZADO" })
            };

            try
            {
                // Build base query with filters
                var baseQuery = _context.Reparacions
                    .AsNoTracking()
                    .Include(r => r.Cliente)
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.TecnicoAsignado)
                    .Include(r => r.EmpleadoAsignado)
                    .Include(r => r.Marca)
                    .Include(r => r.TipoDispositivo)
                    .Include(r => r.ReparacionDetalle)
                    .Where(r => r.CreadoEn >= desde && r.CreadoEn <= hasta);

                // Apply optional filters
                if (technicianId.HasValue)
                {
                    baseQuery = baseQuery.Where(r => r.TecnicoAsignadoId == technicianId.Value);
                }
                if (responsibleId.HasValue)
                {
                    baseQuery = baseQuery.Where(r => r.EmpleadoAsignadoId == responsibleId.Value);
                }
                if (businessId.HasValue)
                {
                    baseQuery = baseQuery.Where(r => r.ComercioId == businessId.Value);
                }

                // Get all relevant orders in a single query
                var allOrders = await baseQuery
                    .Select(r => new
                    {
                        r.ReparacionId,
                        StatusName = r.EstadoReparacion!.Nombre.ToUpper(),
                        CustomerLastName = r.Cliente!.Apellido,
                        CustomerFirstName = r.Cliente.Nombre,
                        DeviceType = r.TipoDispositivo!.Nombre,
                        BrandName = r.Marca!.Nombre,
                        Model = r.ReparacionDetalle != null ? r.ReparacionDetalle.Modelo : null,
                        TechId = r.TecnicoAsignadoId,
                        TechName = r.TecnicoAsignado!.Nombre,
                        ResponsibleName = r.EmpleadoAsignado!.Nombre,
                        IsWarranty = r.ReparacionDetalle != null && r.ReparacionDetalle.EsGarantia,
                        IsDomicile = r.ReparacionDetalle != null && r.ReparacionDetalle.EsDomicilio,
                        r.InformadoEn,
                        r.ModificadoEn
                    })
                    .ToListAsync();

                _logger.LogInformation("GetKanbanBoard: fetched {Count} orders in {Elapsed}ms", 
                    allOrders.Count, sw.ElapsedMilliseconds);

                // Group orders by column
                var columns = new List<KanbanColumn>();
                var totalOrders = 0;

                foreach (var (columnId, displayName, statusValues) in columnDefinitions)
                {
                    var columnOrders = allOrders
                        .Where(o => statusValues.Contains(o.StatusName))
                        .OrderByDescending(o => o.ReparacionId) // Newest first
                        .ToList();

                    var orderCount = columnOrders.Count;
                    totalOrders += orderCount;

                    // Take max 50 orders per column
                    var cards = columnOrders
                        .Take(50)
                        .Select(o => new KanbanOrderCard
                        {
                            OrderNumber = o.ReparacionId,
                            CustomerName = $"{o.CustomerLastName?.ToUpper()}, {o.CustomerFirstName?.ToUpper()}",
                            DeviceSummary = BuildDeviceSummary(o.DeviceType, o.BrandName, o.Model),
                            TechnicianId = o.TechId,
                            TechnicianName = o.TechName ?? string.Empty,
                            ResponsibleName = o.ResponsibleName ?? string.Empty,
                            IsWarranty = o.IsWarranty,
                            IsDomicile = o.IsDomicile,
                            IsReentry = o.StatusName == "REINGRESADO",
                            DaysSinceNotification = CalculateDaysSinceNotification(o.InformadoEn, columnId),
                            LastActivityDate = o.ModificadoEn
                        })
                        .ToList();

                    columns.Add(new KanbanColumn
                    {
                        ColumnId = columnId,
                        DisplayName = displayName,
                        OrderCount = orderCount,
                        Orders = cards
                    });
                }

                sw.Stop();
                _logger.LogInformation("GetKanbanBoard: completed with {TotalOrders} total orders in {Elapsed}ms",
                    totalOrders, sw.ElapsedMilliseconds);

                return new KanbanBoardData
                {
                    Columns = columns,
                    TotalOrders = totalOrders,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogError(ex, "Error getting Kanban board data (elapsed {Elapsed}ms)", sw.ElapsedMilliseconds);
                throw;
            }
        }

        private static string BuildDeviceSummary(string? deviceType, string? brand, string? model)
        {
            var parts = new List<string>();
            if (!string.IsNullOrWhiteSpace(deviceType)) parts.Add(deviceType.ToUpper());
            if (!string.IsNullOrWhiteSpace(brand)) parts.Add(brand.ToUpper());
            if (!string.IsNullOrWhiteSpace(model)) parts.Add(model.ToUpper());
            return string.Join("-", parts);
        }

        private static int? CalculateDaysSinceNotification(DateTime? informadoEn, string columnId)
        {
            // Only show days since notification for PRESUPUESTADO and REPARADO columns
            if (columnId != "PRESUPUESTADO" && columnId != "REPARADO")
                return null;

            if (!informadoEn.HasValue)
                return null;

            return (int)(DateTime.Now - informadoEn.Value).TotalDays;
        }

        /// <summary>
        /// Get movements/comments (Novedades) for an order.
        /// Checks startup cache first, then falls back to DB.
        /// </summary>
        public async Task<List<OrderMovement>> GetOrderMovementsAsync(int orderNumber)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            // 1. Check pre-loaded startup cache first
            var cachedOrder = _orderCacheService.TryGetFromCache(orderNumber);
            if (cachedOrder != null)
            {
                sw.Stop();
                _logger.LogInformation("GetOrderMovements: order {OrderNumber} returned {Count} movements from startup cache in {Elapsed}ms",
                    orderNumber, cachedOrder.Movements.Count, sw.ElapsedMilliseconds);
                return cachedOrder.Movements;
            }

            // 2. Fall back to DB query
            try
            {
                var tipoNovedadLookup = await _context.TipoNovedads
                    .AsNoTracking()
                    .ToDictionaryAsync(t => t.TipoNovedadId, t => t.Nombre);

                var novedades = await _context.Novedads
                    .AsNoTracking()
                    .Where(n => n.ReparacionId == orderNumber)
                    .OrderBy(n => n.ModificadoEn)
                    .ToListAsync();

                var userIds = novedades.Select(n => n.UserId).Distinct().ToList();
                var userLookup = await _context.Usuarios
                    .AsNoTracking()
                    .Where(u => userIds.Contains(u.UserId))
                    .ToDictionaryAsync(u => u.UserId, u => $"{u.Nombre} {u.Apellido}".Trim());

                var movements = novedades.Select(n => new OrderMovement
                {
                    MovementId = n.NovedadId,
                    Type = tipoNovedadLookup.GetValueOrDefault(n.TipoNovedadId, "Desconocido"),
                    Description = n.Observacion ?? string.Empty,
                    Amount = n.Monto,
                    CreatedBy = userLookup.GetValueOrDefault(n.UserId, "Usuario"),
                    CreatedAt = n.ModificadoEn
                }).ToList();

                sw.Stop();
                _logger.LogInformation("GetOrderMovements: order {OrderNumber} loaded {Count} movements from DB in {Elapsed}ms",
                    orderNumber, movements.Count, sw.ElapsedMilliseconds);

                return movements;
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogError(ex, "Error getting movements for order: {OrderNumber} (elapsed {Elapsed}ms)", orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }
    }
}

// Local projected type used for compiled query mapping
internal class ProjectedOrder
{
    public int ReparacionId { get; set; }
    public int? ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string ClienteApellido { get; set; } = string.Empty;
    public int? ClienteDni { get; set; }
    public string? ClienteMail { get; set; }
    public string? ClienteTelefono1 { get; set; }
    public string? ClienteTelefono2 { get; set; }
    public string? ClienteDireccion { get; set; }
    // Direccion structured fields
    public string? DireccionCalle { get; set; }
    public string? DireccionAltura { get; set; }
    public string? DireccionCalle2 { get; set; }
    public string? DireccionCalle3 { get; set; }
    public string? DireccionCiudad { get; set; }
    public string? DireccionCodigoPostal { get; set; }
    public string MarcaNombre { get; set; } = string.Empty;
    public string TipoDispositivoNombre { get; set; } = string.Empty;
    public string EstadoNombre { get; set; } = string.Empty;
    // ReparacionDetalle fields
    public string? DetalleModelo { get; set; }
    public string? DetalleSerie { get; set; }
    public string? DetalleUbicacion { get; set; }
    public string? DetalleAccesorios { get; set; }
    public bool EsGarantia { get; set; }
    public bool EsDomicilio { get; set; }
    public decimal? Presupuesto { get; set; }
    public decimal? Precio { get; set; }
    // User fields
    public int? TecnicoId { get; set; }
    public string TecnicoNombre { get; set; } = string.Empty;
    public string TecnicoApellido { get; set; } = string.Empty;
    public string? TecnicoEmail { get; set; }
    public string? TecnicoTelefono { get; set; }
    public int? ResponsableId { get; set; }
    public string? ResponsableNombre { get; set; }
    public string? ResponsableApellido { get; set; }
    public string? ResponsableEmail { get; set; }
    public string? ResponsableTelefono { get; set; }
    // Dates
    public DateTime CreadoEn { get; set; }
    public DateTime ModificadoEn { get; set; }
    public DateTime? FechaEntrega { get; set; }
}
