using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;
using System.Linq.Expressions;

namespace FastService.McpServer.Services
{
    public class OrderService
    {
        private readonly FastServiceDbContext _context;
        private readonly ILogger<OrderService> _logger;
        private readonly OrderCacheService _cacheService;
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
                       EstadoReparacionId = r.EstadoReparacionId,
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

        public OrderService(FastServiceDbContext context, ILogger<OrderService> logger, OrderCacheService cacheService)
        {
            _context = context;
            _logger = logger;
            _cacheService = cacheService;
        }

        public async Task<List<OrderSummary>> SearchOrdersAsync(OrderSearchCriteria criteria)
        {
            try
            {
                // Use AsNoTracking for read-only queries and avoid eager loading - use projection instead
                var query = _context.Reparacions.AsNoTracking().AsQueryable();

                // Apply filters BEFORE joins for better performance
                if (criteria.OrderNumber.HasValue)
                {
                    query = query.Where(r => r.ReparacionId == criteria.OrderNumber.Value);
                }

                // Model filter - apply early using EF.Functions.Like for index usage
                if (!string.IsNullOrWhiteSpace(criteria.Model))
                {
                    var modelSearch = criteria.Model.Trim();
                    var searchTerm = modelSearch.Trim('*');
                    var likePattern = $"%{searchTerm}%"; // Default contains
                    
                    if (modelSearch.StartsWith("*") && !modelSearch.EndsWith("*"))
                    {
                        likePattern = $"%{searchTerm}"; // Ends with
                    }
                    else if (!modelSearch.StartsWith("*") && modelSearch.EndsWith("*"))
                    {
                        likePattern = $"{searchTerm}%"; // Starts with
                    }
                    
                    query = query.Where(r => r.ReparacionDetalle != null && 
                        r.ReparacionDetalle.Modelo != null &&
                        EF.Functions.Like(r.ReparacionDetalle.Modelo, likePattern));
                }

                // Status filter - apply early for efficiency
                if (!string.IsNullOrWhiteSpace(criteria.Status))
                {
                    var statusPattern = $"%{criteria.Status}%";
                    query = query.Where(r => EF.Functions.Like(r.EstadoReparacion!.Nombre, statusPattern));
                }

                // Handle multiple statuses - build dynamic OR expression to avoid EF Core OPENJSON issues
                if (criteria.Statuses != null && criteria.Statuses.Count > 0)
                {
                    // Get all statuses and filter in memory to get IDs
                    var allStatuses = await _context.EstadoReparacions
                        .AsNoTracking()
                        .Select(e => new { e.EstadoReparacionId, e.Nombre })
                        .ToListAsync();
                    
                    var statusIds = allStatuses
                        .Where(e => criteria.Statuses.Contains(e.Nombre))
                        .Select(e => e.EstadoReparacionId)
                        .ToList();
                    
                    if (statusIds.Count > 0)
                    {
                        // Build dynamic OR expression: r.EstadoReparacionId == id1 || r.EstadoReparacionId == id2 || ...
                        var parameter = Expression.Parameter(typeof(Reparacion), "r");
                        var property = Expression.Property(parameter, nameof(Reparacion.EstadoReparacionId));
                        
                        Expression? combinedExpression = null;
                        foreach (var statusId in statusIds)
                        {
                            var equality = Expression.Equal(property, Expression.Constant(statusId));
                            combinedExpression = combinedExpression == null 
                                ? equality 
                                : Expression.OrElse(combinedExpression, equality);
                        }
                        
                        if (combinedExpression != null)
                        {
                            var lambda = Expression.Lambda<Func<Reparacion, bool>>(combinedExpression, parameter);
                            query = query.Where(lambda);
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(criteria.CustomerName))
                {
                    var searchTerm = criteria.CustomerName.Trim();
                    var searchParts = searchTerm.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    
                    // Use EF.Functions.Like for SQL LIKE which is case-insensitive with default collation
                    if (searchParts.Length == 1)
                    {
                        var term = $"%{searchParts[0]}%";
                        query = query.Where(r =>
                            EF.Functions.Like(r.Cliente!.Nombre, term) ||
                            EF.Functions.Like(r.Cliente.Apellido, term));
                    }
                    else if (searchParts.Length == 2)
                    {
                        var part1 = $"%{searchParts[0]}%";
                        var part2 = $"%{searchParts[1]}%";
                        var fullTerm = $"%{searchTerm}%";
                        query = query.Where(r =>
                            EF.Functions.Like(r.Cliente!.Nombre, fullTerm) ||
                            EF.Functions.Like(r.Cliente.Apellido, fullTerm) ||
                            (EF.Functions.Like(r.Cliente.Nombre, part1) && EF.Functions.Like(r.Cliente.Apellido, part2)) ||
                            (EF.Functions.Like(r.Cliente.Nombre, part2) && EF.Functions.Like(r.Cliente.Apellido, part1)));
                    }
                    else
                    {
                        var fullTerm = $"%{searchTerm}%";
                        query = query.Where(r =>
                            EF.Functions.Like(r.Cliente!.Nombre, fullTerm) ||
                            EF.Functions.Like(r.Cliente.Apellido, fullTerm));
                    }
                }

                if (!string.IsNullOrWhiteSpace(criteria.DNI))
                {
                    if (int.TryParse(criteria.DNI, out var dniValue))
                    {
                        query = query.Where(r => r.Cliente!.Dni == dniValue);
                    }
                }

                // Address search - fuzzy match on cliente direccion or localidad
                if (!string.IsNullOrWhiteSpace(criteria.Address))
                {
                    var addressPattern = $"%{criteria.Address.Trim()}%";
                    query = query.Where(r =>
                        EF.Functions.Like(r.Cliente!.Direccion, addressPattern) ||
                        (r.Cliente.Localidad != null && EF.Functions.Like(r.Cliente.Localidad, addressPattern)));
                }

                if (!string.IsNullOrWhiteSpace(criteria.Brand))
                {
                    var brandPattern = $"%{criteria.Brand}%";
                    query = query.Where(r => EF.Functions.Like(r.Marca!.Nombre, brandPattern));
                }

                if (!string.IsNullOrWhiteSpace(criteria.DeviceType))
                {
                    var devicePattern = $"%{criteria.DeviceType}%";
                    query = query.Where(r => EF.Functions.Like(r.TipoDispositivo!.Nombre, devicePattern));
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
                        Model = r.ReparacionDetalle != null ? r.ReparacionDetalle.Modelo : null,
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
                        EstadoReparacionId = projected.EstadoReparacionId,
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

                // Get tipo novedad lookup - load all types (small table) to avoid OPENJSON issues
                var tipoNovedadLookup = await _context.TipoNovedads
                    .AsNoTracking()
                    .ToDictionaryAsync(t => t.TipoNovedadId, t => t.Nombre);

                // Get user lookup for names - load all users (small table) to avoid OPENJSON issues
                var allUsuarios = await _context.Usuarios
                    .AsNoTracking()
                    .Select(u => new { u.UserId, u.Nombre })
                    .ToListAsync();
                var usuarioLookup = allUsuarios.ToDictionary(u => u.UserId, u => u.Nombre);

                // Map to DTOs
                var novedades = novedadesRaw.Select(n => new NovedadInfo
                {
                    Id = n.NovedadId,
                    Fecha = n.ModificadoEn,
                    Tipo = tipoNovedadLookup.GetValueOrDefault(n.TipoNovedadId, "Desconocido"),
                    Monto = n.Monto,
                    Observacion = n.Observacion,
                    UsuarioId = n.UserId,
                    UsuarioNombre = usuarioLookup.GetValueOrDefault(n.UserId)
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
        /// Returns 7 fixed columns: INGRESADO, A_REPARAR, RECHAZO_PRESUP (cliente), PRESUPUESTADO, ESP_REPUESTO, REPARADO, RECHAZADO (técnico)
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
            // Reordered: INGRESADO → A_REPARAR → RECHAZO_PRESUP → PRESUPUESTADO → ESP_REPUESTO → REPARADO → RECHAZADO
            // Two types of rejection:
            // - RECHAZADO (por técnico): Internal rejection, can't repair (no parts, etc.)
            // - RECHAZO_PRESUP (por cliente): Client rejects the budget quote
            // - PEND_RETIRO: Equipment assembled, waiting for customer pickup
            var columnDefinitions = new[]
            {
                ("INGRESADO", "INGRESADO", new[] { "INGRESADO" }),
                ("A_REPARAR", "A REPARAR", new[] { "A REPARAR", "REINGRESADO" }), // Merged column
                ("RECHAZO_PRESUP", "Rechazado (cliente)", new[] { "RECHAZO PRESUP." }),
                ("PRESUPUESTADO", "PRESUPUESTADO", new[] { "PRESUPUESTADO" }),
                ("REPARADO", "REPARADO", new[] { "REPARADO" }),
                ("RECHAZADO", "Rechazado (técnico)", new[] { "RECHAZADO" }),
                ("PEND_RETIRO", "Pend. Retiro", new[] { "PEND. RETIRO" }),
                ("ESP_REPUESTO", "ESP. REPUESTO", new[] { "ESP. REPUESTO" })
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
        /// Add a new novedad (note/movement) to an order
        /// </summary>
        public async Task<OrderMovement> AddNovedadAsync(AddNovedadRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                // Verify order exists
                var order = await _context.Reparacions.FindAsync(request.OrderNumber);
                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{request.OrderNumber} not found");
                }

                // Get the user ID (default to technician if not provided)
                var userId = request.UserId ?? order.TecnicoAsignadoId;

                // Create the novedad
                var novedad = new Novedad
                {
                    ReparacionId = request.OrderNumber,
                    TipoNovedadId = request.TipoNovedadId,
                    Observacion = request.Observacion,
                    Monto = request.Monto,
                    UserId = userId,
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = userId
                };

                _context.Novedads.Add(novedad);
                await _context.SaveChangesAsync();

                // Invalidate cache so next fetch gets fresh data
                _cacheService.Invalidate(request.OrderNumber);

                // Get type name for response
                var tipoNombre = await _context.TipoNovedads
                    .Where(t => t.TipoNovedadId == request.TipoNovedadId)
                    .Select(t => t.Nombre)
                    .FirstOrDefaultAsync() ?? "Desconocido";

                // Get user name for response
                var userName = await _context.Usuarios
                    .Where(u => u.UserId == userId)
                    .Select(u => $"{u.Nombre} {u.Apellido}".Trim())
                    .FirstOrDefaultAsync() ?? "Usuario";

                sw.Stop();
                _logger.LogInformation("AddNovedad: Added {Type} to order #{OrderNumber} in {Elapsed}ms",
                    tipoNombre, request.OrderNumber, sw.ElapsedMilliseconds);

                return new OrderMovement
                {
                    MovementId = novedad.NovedadId,
                    Type = tipoNombre,
                    Description = novedad.Observacion ?? string.Empty,
                    Amount = novedad.Monto,
                    CreatedBy = userName,
                    CreatedAt = novedad.ModificadoEn
                };
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogError(ex, "Error adding novedad to order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    request.OrderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Delete a novedad (note/movement) from an order
        /// </summary>
        public async Task<bool> DeleteNovedadAsync(int orderNumber, int novedadId)
        {
            try
            {
                // Get the novedad
                var novedad = await _context.Novedads
                    .FirstOrDefaultAsync(n => n.NovedadId == novedadId && n.ReparacionId == orderNumber);

                if (novedad == null)
                {
                    throw new InvalidOperationException($"Novedad #{novedadId} not found for order #{orderNumber}");
                }

                _context.Novedads.Remove(novedad);
                await _context.SaveChangesAsync();

                // Invalidate cache so next fetch gets fresh data
                _cacheService.Invalidate(orderNumber);

                _logger.LogInformation("Deleted novedad #{NovedadId} from order #{OrderNumber}", novedadId, orderNumber);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting novedad #{NovedadId} from order #{OrderNumber}", novedadId, orderNumber);
                throw;
            }
        }

        /// <summary>
        /// Delete an order and all its related data
        /// </summary>
        public async Task<bool> DeleteOrderAsync(int orderNumber)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get the order with all related entities
                var order = await _context.Reparacions
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                // Delete all novedades for this order
                var novedades = await _context.Novedads
                    .Where(n => n.ReparacionId == orderNumber)
                    .ToListAsync();
                _context.Novedads.RemoveRange(novedades);

                // Delete reparacion detalle if exists
                if (order.ReparacionDetalle != null)
                {
                    _context.ReparacionDetalles.Remove(order.ReparacionDetalle);
                }

                // Delete the order itself
                _context.Reparacions.Remove(order);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Deleted order #{OrderNumber} and all related data ({NovedadesCount} novedades)", 
                    orderNumber, novedades.Count);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting order #{OrderNumber}", orderNumber);
                throw;
            }
        }

        /// <summary>
        /// Process a "Retira" (withdrawal) action on an order.
        /// This marks the order as withdrawn, records the payment, and creates accounting entries.
        /// </summary>
        public async Task<ProcessRetiraResponse> ProcessRetiraAsync(ProcessRetiraRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get the order with its detail
                var order = await _context.Reparacions
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == request.OrderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{request.OrderNumber} not found");
                }

                // Get the "RETIRADO" status ID
                var retiradoEstado = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre.ToUpper() == ReparacionEstado.RETIRADO);

                if (retiradoEstado == null)
                {
                    throw new InvalidOperationException("Estado 'RETIRADO' not found in database");
                }

                // Get payment method name for response
                var metodoPago = await _context.MetodoPagos
                    .FirstOrDefaultAsync(m => m.MetodoPagoId == request.MetodoPagoId);

                var metodoPagoNombre = metodoPago?.Nombre ?? "Desconocido";

                // Get user ID
                var userId = request.UserId ?? order.TecnicoAsignadoId;

                // 1. Create Novedad (RETIRA type = 5)
                var novedad = new Data.Entities.Novedad
                {
                    ReparacionId = request.OrderNumber,
                    TipoNovedadId = NovedadTipoIds.RETIRA,
                    Observacion = $"Retiro - Monto: ${request.Monto:N2} - Método: {metodoPagoNombre}",
                    Monto = request.Monto,
                    UserId = userId,
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = userId
                };
                _context.Novedads.Add(novedad);

                // 2. Update order status to RETIRADO
                order.EstadoReparacionId = retiradoEstado.EstadoReparacionId;
                order.ModificadoPor = userId;
                order.ModificadoEn = DateTime.Now;

                // 3. Update ReparacionDetalle.Precio
                if (order.ReparacionDetalle != null)
                {
                    order.ReparacionDetalle.Precio = request.Monto;
                }

                // 4. Create accounting entry (Venta) if Monto > 0
                int? ventaId = null;
                if (request.Monto > 0)
                {
                    int? facturaId = null;

                    // Create Factura record if facturado
                    if (request.Facturado && request.TipoFacturaId.HasValue)
                    {
                        var factura = new Data.Entities.Factura
                        {
                            NroFactura = request.NroFactura ?? string.Empty,
                            TipoFacturaId = request.TipoFacturaId.Value,
                            ModificadoEn = DateTime.Now,
                            ModificadoPor = userId
                        };
                        _context.Facturas.Add(factura);
                        await _context.SaveChangesAsync();
                        facturaId = factura.FacturaId;
                    }

                    // Create Venta record
                    var venta = new Data.Entities.Ventum
                    {
                        Descripcion = $"Pago por servicio de FastService orden {order.ReparacionId}",
                        ClienteId = order.ClienteId,
                        Monto = request.Monto,
                        RefNumber = order.ReparacionId.ToString(),
                        PuntoDeVentaId = 1, // Default punto de venta
                        FacturaId = facturaId,
                        MetodoPagoId = request.MetodoPagoId,
                        TipoTransaccionId = request.Facturado ? 1 : 2, // 1 = facturado, 2 = no facturado
                        Fecha = DateTime.Now,
                        Vendedor = order.EmpleadoAsignadoId,
                        Facturado = request.Facturado
                    };
                    _context.Venta.Add(venta);
                    await _context.SaveChangesAsync();
                    ventaId = venta.VentaId;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessRetira: Order #{OrderNumber} withdrawn successfully in {Elapsed}ms", 
                    request.OrderNumber, sw.ElapsedMilliseconds);

                return new ProcessRetiraResponse
                {
                    OrderNumber = request.OrderNumber,
                    NewStatus = ReparacionEstado.RETIRADO,
                    MontoRegistrado = request.Monto,
                    MetodoPago = metodoPagoNombre,
                    Facturado = request.Facturado,
                    VentaId = ventaId,
                    ProcessedAt = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing retira for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    request.OrderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process a "Seña" (deposit/advance payment) action on an order.
        /// This records the deposit, creates a novedad, and creates accounting entries.
        /// Unlike Retira, this does NOT change the order status.
        /// </summary>
        public async Task<ProcessSenaResponse> ProcessSenaAsync(ProcessSenaRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get the order with its detail
                var order = await _context.Reparacions
                    .Include(r => r.ReparacionDetalle)
                    .Include(r => r.EstadoReparacion)
                    .FirstOrDefaultAsync(r => r.ReparacionId == request.OrderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{request.OrderNumber} not found");
                }

                // Get payment method name for response
                var metodoPago = await _context.MetodoPagos
                    .FirstOrDefaultAsync(m => m.MetodoPagoId == request.MetodoPagoId);

                var metodoPagoNombre = metodoPago?.Nombre ?? "Desconocido";

                // Get user ID
                var userId = request.UserId ?? order.TecnicoAsignadoId;

                // 1. Create Novedad (SENA type = 26)
                var novedad = new Data.Entities.Novedad
                {
                    ReparacionId = request.OrderNumber,
                    TipoNovedadId = NovedadTipoIds.SENA,
                    Observacion = $"Seña - Monto: ${request.Monto:N2} - Método: {metodoPagoNombre}",
                    Monto = request.Monto,
                    UserId = userId,
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = userId
                };
                _context.Novedads.Add(novedad);
                await _context.SaveChangesAsync();

                // 2. Update order modification timestamp (but NOT status - seña doesn't change status)
                order.ModificadoPor = userId;
                order.ModificadoEn = DateTime.Now;

                // 3. Create accounting entry (Venta) if Monto > 0
                int? ventaId = null;
                if (request.Monto > 0)
                {
                    int? facturaId = null;

                    // Create Factura record if facturado
                    if (request.Facturado && request.TipoFacturaId.HasValue)
                    {
                        var factura = new Data.Entities.Factura
                        {
                            NroFactura = request.NroFactura ?? string.Empty,
                            TipoFacturaId = request.TipoFacturaId.Value,
                            ModificadoEn = DateTime.Now,
                            ModificadoPor = userId
                        };
                        _context.Facturas.Add(factura);
                        await _context.SaveChangesAsync();
                        facturaId = factura.FacturaId;
                    }

                    // Create Venta record - note the different description for Seña
                    var venta = new Data.Entities.Ventum
                    {
                        Descripcion = $"Seña por servicio de FastService orden {order.ReparacionId}",
                        ClienteId = order.ClienteId,
                        Monto = request.Monto,
                        RefNumber = order.ReparacionId.ToString(),
                        PuntoDeVentaId = 1, // Default punto de venta
                        FacturaId = facturaId,
                        MetodoPagoId = request.MetodoPagoId,
                        TipoTransaccionId = request.Facturado ? 1 : 2, // 1 = facturado, 2 = no facturado
                        Fecha = DateTime.Now,
                        Vendedor = order.EmpleadoAsignadoId,
                        Facturado = request.Facturado
                    };
                    _context.Venta.Add(venta);
                    await _context.SaveChangesAsync();
                    ventaId = venta.VentaId;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessSena: Order #{OrderNumber} deposit recorded successfully in {Elapsed}ms", 
                    request.OrderNumber, sw.ElapsedMilliseconds);

                return new ProcessSenaResponse
                {
                    OrderNumber = request.OrderNumber,
                    CurrentStatus = order.EstadoReparacion?.Nombre ?? "Desconocido",
                    MontoRegistrado = request.Monto,
                    MetodoPago = metodoPagoNombre,
                    Facturado = request.Facturado,
                    VentaId = ventaId,
                    NovedadId = novedad.NovedadId,
                    ProcessedAt = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing seña for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    request.OrderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Informar Presupuesto - informs the customer of the quote
        /// Actions: "acepta" (customer accepts), "rechaza" (customer rejects), "confirma" (pending confirmation)
        /// NovedadTipo: ACEPTA=3, RECHAZA=6, PRESUPINFOR=31
        /// Status changes: Acepta→"A REPARAR", Rechaza→"RECHAZO PRESUP.", Confirma→"PRESUPUESTADO"
        /// </summary>
        public async Task<InformarPresupuestoResponse> ProcessInformarPresupuestoAsync(int orderNumber, InformarPresupuestoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessInformarPresupuesto: Starting for order #{OrderNumber}, Action: {Accion}", 
                orderNumber, request.Accion);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Load order with related entities
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";

                // Determine NovedadTipo based on action
                int novedadTipoId;
                string newStatusName;
                var accionNormalizada = request.Accion.ToUpper().Trim();

                switch (accionNormalizada)
                {
                    case "ACEPTA":
                        novedadTipoId = 3; // ACEPTA
                        newStatusName = "A REPARAR";
                        break;
                    case "RECHAZA":
                        novedadTipoId = 6; // RECHAZA
                        newStatusName = "RECHAZO PRESUP.";
                        break;
                    case "CONFIRMA":
                    default:
                        novedadTipoId = 31; // PRESUPINFOR
                        newStatusName = "PRESUPUESTADO";
                        break;
                }

                // Get new status ID
                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Create Novedad record
                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = novedadTipoId,
                    Observacion = request.Observacion ?? $"Presupuesto informado - Cliente {request.Accion.ToLower()}",
                    Monto = request.Monto ?? 0,
                    UserId = 1, // TODO: Get current user from context
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                // Update ReparacionDetalle
                if (order.ReparacionDetalle != null)
                {
                    // Update presupuesto if a new amount was provided
                    if (request.Monto.HasValue && request.Monto.Value > 0)
                    {
                        order.ReparacionDetalle.Presupuesto = request.Monto.Value;
                    }
                    order.ReparacionDetalle.PresupuestoFecha = DateTime.Now;
                }

                // If customer accepts, assign employee to technician
                if (accionNormalizada == "ACEPTA" && order.TecnicoAsignadoId > 0)
                {
                    order.EmpleadoAsignadoId = order.TecnicoAsignadoId;
                }

                // Update informado fields
                order.InformadoEn = DateTime.Now;
                order.InformadoPor = 1; // TODO: Get current user

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessInformarPresupuesto: Order #{OrderNumber} updated successfully in {Elapsed}ms. Action: {Accion}, NewStatus: {NewStatus}", 
                    orderNumber, sw.ElapsedMilliseconds, request.Accion, newStatusName);

                return new InformarPresupuestoResponse
                {
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    Accion = request.Accion,
                    Presupuesto = order.ReparacionDetalle?.Presupuesto ?? 0,
                    NovedadId = novedad.NovedadId,
                    InformadoEn = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing informar presupuesto for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Reingreso - re-entry of equipment after being picked up
        /// NovedadTipo: REINGRESO=24
        /// Status changes: Always → "REINGRESADO"
        /// </summary>
        public async Task<ReingresoResponse> ProcessReingresoAsync(int orderNumber, ReingresoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessReingreso: Starting for order #{OrderNumber}", orderNumber);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Load order with related entities
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                const string newStatusName = "REINGRESADO";

                // Get new status ID
                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName);

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Create Novedad record
                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 24, // REINGRESO
                    Observacion = request.Observacion,
                    Monto = 0,
                    UserId = 1, // TODO: Get current user from context
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessReingreso: Order #{OrderNumber} reingresado successfully in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new ReingresoResponse
                {
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    NovedadId = novedad.NovedadId,
                    Observacion = request.Observacion
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing reingreso for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Rechaza Presupuesto - CLIENT rejects the budget quote
        /// This is different from technician rejection (no parts, can't repair)
        /// NovedadTipo: RECHAZA=6
        /// Status changes: Always → "RECHAZO PRESUP."
        /// </summary>
        public async Task<RechazaPresupuestoResponse> ProcessRechazaPresupuestoAsync(int orderNumber, RechazaPresupuestoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessRechazaPresupuesto: Starting for order #{OrderNumber}", orderNumber);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Load order with related entities
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                const string newStatusName = "RECHAZO PRESUP.";

                // Get new status ID
                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Create Novedad record - RECHAZA (client rejection)
                var observacion = string.IsNullOrWhiteSpace(request.Observacion) 
                    ? "Cliente rechaza presupuesto" 
                    : request.Observacion;

                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 6, // RECHAZA
                    Observacion = observacion,
                    Monto = 0,
                    UserId = 1, // TODO: Get current user from context
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessRechazaPresupuesto: Order #{OrderNumber} rejected by client successfully in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new RechazaPresupuestoResponse
                {
                    Success = true,
                    Message = $"Presupuesto rechazado por cliente. Estado cambiado a {newStatusName}",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing rechaza presupuesto for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        // ===================== TÉCNICO ACTIONS =====================

        /// <summary>
        /// Process Presupuesto - TECHNICIAN creates a budget/quote
        /// NovedadTipo: PRESUPUESTADO = 2
        /// Status changes: → "PRESUPUESTADO" or "PRESUP. EN DOMICILIO" (if domicile order)
        /// </summary>
        public async Task<PresupuestoResponse> ProcessPresupuestoAsync(int orderNumber, PresupuestoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessPresupuesto: Starting for order #{OrderNumber}, Monto: {Monto}", 
                orderNumber, request.Monto);

            if (request.Monto <= 0)
            {
                throw new ArgumentException("El monto del presupuesto debe ser mayor a 0");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                
                // Check if order is domicile to determine status
                var isDomicile = order.ReparacionDetalle?.EsDomicilio ?? false;
                var newStatusName = isDomicile ? "PRESUP. EN DOMICILIO" : "PRESUPUESTADO";

                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    // Fallback to PRESUPUESTADO if PRESUP. EN DOMICILIO doesn't exist
                    newStatusName = "PRESUPUESTADO";
                    newStatus = await _context.EstadoReparacions
                        .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());
                }

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Update budget in ReparacionDetalle
                if (order.ReparacionDetalle != null)
                {
                    order.ReparacionDetalle.Presupuesto = request.Monto;
                    order.ReparacionDetalle.PresupuestoFecha = DateTime.Now;
                    order.ReparacionDetalle.ModificadoEn = DateTime.Now;
                    order.ReparacionDetalle.ModificadoPor = 1;
                }

                // Create Novedad record
                // Observacion contains the work description (trabajo a realizar) entered by the technician
                var observacion = string.IsNullOrWhiteSpace(request.Observacion)
                    ? $"Presupuesto: ${request.Monto:N0}"
                    : $"Trabajo: {request.Observacion} - Presupuesto: ${request.Monto:N0}";

                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 2, // PRESUPUESTADO
                    Observacion = observacion,
                    Monto = request.Monto,
                    UserId = 1, // TODO: Get current user
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessPresupuesto: Order #{OrderNumber} presupuestado successfully in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new PresupuestoResponse
                {
                    Success = true,
                    Message = $"Presupuesto creado. Estado cambiado a {newStatusName}",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    Monto = request.Monto,
                    Trabajo = request.Observacion,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing presupuesto for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Reparado - TECHNICIAN marks order as repaired
        /// NovedadTipo: REPARADO = 4
        /// Status changes: → "REPARADO"
        /// </summary>
        public async Task<ReparadoResponse> ProcessReparadoAsync(int orderNumber, ReparadoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessReparado: Starting for order #{OrderNumber}", orderNumber);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                const string newStatusName = "REPARADO";

                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Save repair description in ReparacionDetalle
                if (order.ReparacionDetalle != null && !string.IsNullOrWhiteSpace(request.Observacion))
                {
                    order.ReparacionDetalle.ReparacionDesc = request.Observacion;
                    order.ReparacionDetalle.ModificadoEn = DateTime.Now;
                    order.ReparacionDetalle.ModificadoPor = 1;
                }

                // Create Novedad record
                var observacion = string.IsNullOrWhiteSpace(request.Observacion)
                    ? "Equipo reparado"
                    : request.Observacion;

                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 4, // REPARADO
                    Observacion = observacion,
                    Monto = 0,
                    UserId = 1,
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessReparado: Order #{OrderNumber} marked as repaired in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new ReparadoResponse
                {
                    Success = true,
                    Message = "Equipo marcado como reparado",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing reparado for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Rechazar - TECHNICIAN can't repair (no parts, irreparable, etc.)
        /// NovedadTipo: RECHAZA = 6
        /// Status changes: → "RECHAZADO"
        /// Different from client rejection (RECHAZO PRESUP.)
        /// </summary>
        public async Task<RechazarResponse> ProcessRechazarAsync(int orderNumber, RechazarRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessRechazar: Starting for order #{OrderNumber}", orderNumber);

            if (string.IsNullOrWhiteSpace(request.Observacion))
            {
                throw new ArgumentException("Debe indicar el motivo del rechazo");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                const string newStatusName = "RECHAZADO";

                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Create Novedad record
                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 6, // RECHAZA (technician rejection)
                    Observacion = request.Observacion,
                    Monto = 0,
                    UserId = 1,
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessRechazar: Order #{OrderNumber} rejected by technician in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new RechazarResponse
                {
                    Success = true,
                    Message = "Reparación rechazada por técnico",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing rechazar for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Espera Repuesto - TECHNICIAN marks order as waiting for parts
        /// NovedadTipo: ESPERAREPUESTO = 16
        /// Status changes: → "ESP. REPUESTO"
        /// </summary>
        public async Task<EsperaRepuestoResponse> ProcessEsperaRepuestoAsync(int orderNumber, EsperaRepuestoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessEsperaRepuesto: Starting for order #{OrderNumber}", orderNumber);

            if (string.IsNullOrWhiteSpace(request.Observacion))
            {
                throw new ArgumentException("Debe indicar qué repuesto se necesita");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                const string newStatusName = "ESP. REPUESTO";

                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Create Novedad record
                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 16, // ESPERAREPUESTO
                    Observacion = request.Observacion,
                    Monto = 0,
                    UserId = 1,
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessEsperaRepuesto: Order #{OrderNumber} waiting for parts in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new EsperaRepuestoResponse
                {
                    Success = true,
                    Message = "Orden marcada en espera de repuesto",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing espera repuesto for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Rep. Domicilio - TECHNICIAN completes home repair
        /// NovedadTipo: REPDOMICILIO = 40
        /// Status changes: → "RETIRADO" (completed)
        /// Generates accounting entry if monto > 0
        /// </summary>
        public async Task<RepDomicilioResponse> ProcessRepDomicilioAsync(int orderNumber, RepDomicilioRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessRepDomicilio: Starting for order #{OrderNumber}, Monto: {Monto}", 
                orderNumber, request.Monto);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";
                const string newStatusName = "RETIRADO";

                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == newStatusName.ToUpper());

                if (newStatus == null)
                {
                    throw new InvalidOperationException($"Status '{newStatusName}' not found in database");
                }

                // Update price in ReparacionDetalle
                if (order.ReparacionDetalle != null)
                {
                    order.ReparacionDetalle.Precio = request.Monto;
                    order.ReparacionDetalle.ModificadoEn = DateTime.Now;
                    order.ReparacionDetalle.ModificadoPor = 1;
                }

                // Create Novedad record
                var observacion = string.IsNullOrWhiteSpace(request.Observacion)
                    ? $"Reparación a domicilio completada. Monto: ${request.Monto:N0}"
                    : request.Observacion;

                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = 40, // REPDOMICILIO
                    Observacion = observacion,
                    Monto = request.Monto,
                    UserId = 1,
                    ModificadoPor = 1,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = 1;
                order.ModificadoEn = DateTime.Now;

                int? ventaId = null;

                // Generate accounting entry if amount > 0
                if (request.Monto > 0)
                {
                    int? facturaId = null;

                    if (request.Facturado && !string.IsNullOrWhiteSpace(request.NroFactura))
                    {
                        var factura = new Factura
                        {
                            NroFactura = request.NroFactura,
                            TipoFacturaId = request.TipoFacturaId ?? 1,
                            ModificadoEn = DateTime.Now,
                            ModificadoPor = 1
                        };
                        _context.Facturas.Add(factura);
                        await _context.SaveChangesAsync();
                        facturaId = factura.FacturaId;
                    }

                    var venta = new Ventum
                    {
                        Descripcion = $"Reparación a domicilio FastService orden {orderNumber}",
                        Monto = request.Monto,
                        MetodoPagoId = request.MetodoPagoId,
                        FacturaId = facturaId,
                        Facturado = request.Facturado,
                        Fecha = DateTime.Now,
                        Vendedor = 1, // Default vendor
                        PuntoDeVentaId = 1, // Default POS
                        TipoTransaccionId = 1, // Default transaction type
                        ClienteId = order.ClienteId
                    };
                    _context.Venta.Add(venta);
                    await _context.SaveChangesAsync();
                    ventaId = venta.VentaId;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessRepDomicilio: Order #{OrderNumber} completed home repair in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new RepDomicilioResponse
                {
                    Success = true,
                    Message = "Reparación a domicilio completada",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = newStatusName,
                    Monto = request.Monto,
                    NovedadId = novedad.NovedadId,
                    VentaId = ventaId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing rep domicilio for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Armado - TECHNICIAN assembles/packs equipment for pickup
        /// Changes status from RECHAZADO or RECHAZO PRESUP. to PEND. RETIRO
        /// </summary>
        public async Task<ProcessArmadoResponse> ProcessArmadoAsync(int orderNumber, ProcessArmadoRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessArmado: Starting for order #{OrderNumber}", orderNumber);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";

                // Validate that order is in a rejected state
                var validStatuses = new[] { "RECHAZADO", "RECHAZO PRESUP." };
                if (!validStatuses.Contains(previousStatus.ToUpper()))
                {
                    throw new InvalidOperationException($"La orden debe estar en estado RECHAZADO o RECHAZO PRESUP. para poder armarla. Estado actual: {previousStatus}");
                }

                // Get or create the PEND. RETIRO status
                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == ReparacionEstado.PEND_RETIRO.ToUpper());

                if (newStatus == null)
                {
                    // Create the status if it doesn't exist
                    newStatus = new EstadoReparacion
                    {
                        Nombre = ReparacionEstado.PEND_RETIRO,
                        Descripcion = "Equipo armado, pendiente de retiro por el cliente",
                        Activo = true
                    };
                    _context.EstadoReparacions.Add(newStatus);
                    await _context.SaveChangesAsync();
                }

                // Get or create the ARMADO novedad type
                var tipoNovedad = await _context.TipoNovedads
                    .FirstOrDefaultAsync(t => t.TipoNovedadId == NovedadTipoIds.ARMADO);

                if (tipoNovedad == null)
                {
                    tipoNovedad = new TipoNovedad
                    {
                        TipoNovedadId = NovedadTipoIds.ARMADO,
                        Nombre = "ARMADO",
                        Descripcion = "Equipo armado y listo para retiro por el cliente",
                        Activo = true,
                        ModificadoEn = DateTime.Now,
                        ModificadoPor = 1
                    };
                    _context.TipoNovedads.Add(tipoNovedad);
                    await _context.SaveChangesAsync();
                }

                // Create Novedad record with combined observation
                var observacion = string.IsNullOrWhiteSpace(request.Observacion)
                    ? "Equipo armado y listo para retiro"
                    : $"Equipo armado y listo para retiro. {request.Observacion}";

                var userId = request.UserId ?? 1;
                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = NovedadTipoIds.ARMADO,
                    Observacion = observacion,
                    Monto = 0,
                    UserId = userId,
                    ModificadoPor = userId,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = userId;
                order.ModificadoEn = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessArmado: Order #{OrderNumber} assembled for pickup in {Elapsed}ms", 
                    orderNumber, sw.ElapsedMilliseconds);

                return new ProcessArmadoResponse
                {
                    Success = true,
                    Message = "Equipo armado y listo para retiro",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = ReparacionEstado.PEND_RETIRO,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing armado for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Process Archivar - ADMIN archives equipment to stock (equipment becomes shop property)
        /// Changes status to ARCHIVADO, records the storage location
        /// </summary>
        public async Task<ProcessArchivarResponse> ProcessArchivarAsync(int orderNumber, ProcessArchivarRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("ProcessArchivar: Starting for order #{OrderNumber}, Ubicacion: {Ubicacion}", 
                orderNumber, request.Ubicacion);

            if (string.IsNullOrWhiteSpace(request.Ubicacion))
            {
                throw new ArgumentException("Debe indicar la ubicación donde se guardará el equipo");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                {
                    throw new InvalidOperationException($"Order #{orderNumber} not found");
                }

                var previousStatus = order.EstadoReparacion?.Nombre ?? "Desconocido";

                // Get or create the ARCHIVADO status
                var newStatus = await _context.EstadoReparacions
                    .FirstOrDefaultAsync(e => e.Nombre != null && e.Nombre.ToUpper() == ReparacionEstado.ARCHIVADO.ToUpper());

                if (newStatus == null)
                {
                    // Create the status if it doesn't exist
                    newStatus = new EstadoReparacion
                    {
                        Nombre = ReparacionEstado.ARCHIVADO,
                        Descripcion = "Equipo pasó a stock del negocio para repuestos",
                        Activo = true
                    };
                    _context.EstadoReparacions.Add(newStatus);
                    await _context.SaveChangesAsync();
                }

                // Get or create the ARCHIVADO novedad type
                var tipoNovedad = await _context.TipoNovedads
                    .FirstOrDefaultAsync(t => t.TipoNovedadId == NovedadTipoIds.ARCHIVADO);

                if (tipoNovedad == null)
                {
                    tipoNovedad = new TipoNovedad
                    {
                        TipoNovedadId = NovedadTipoIds.ARCHIVADO,
                        Nombre = "ARCHIVADO",
                        Descripcion = "Equipo archivado en stock del negocio",
                        Activo = true,
                        ModificadoEn = DateTime.Now,
                        ModificadoPor = 1
                    };
                    _context.TipoNovedads.Add(tipoNovedad);
                    await _context.SaveChangesAsync();
                }

                // Create detailed Novedad record with location info
                var observacionParts = new List<string> { "Equipo archivado - pasó a stock del negocio" };
                if (!string.IsNullOrWhiteSpace(request.Observacion))
                {
                    observacionParts.Add(request.Observacion);
                }
                observacionParts.Add($"UBICACION EN STOCK: {request.Ubicacion}");
                var observacion = string.Join("\n", observacionParts);

                var userId = request.UserId ?? 1;
                var novedad = new Novedad
                {
                    ReparacionId = orderNumber,
                    TipoNovedadId = NovedadTipoIds.ARCHIVADO,
                    Observacion = observacion,
                    Monto = 0,
                    UserId = userId,
                    ModificadoPor = userId,
                    ModificadoEn = DateTime.Now
                };
                _context.Novedads.Add(novedad);

                // Update order status
                order.EstadoReparacionId = newStatus.EstadoReparacionId;
                order.ModificadoPor = userId;
                order.ModificadoEn = DateTime.Now;

                // Update ubicacion in ReparacionDetalle
                if (order.ReparacionDetalle != null)
                {
                    order.ReparacionDetalle.Unicacion = request.Ubicacion;
                    order.ReparacionDetalle.ModificadoPor = userId;
                    order.ReparacionDetalle.ModificadoEn = DateTime.Now;
                }
                else if (order.ReparacionDetalleId.HasValue)
                {
                    // Load detalle separately if not included
                    var detalle = await _context.ReparacionDetalles.FindAsync(order.ReparacionDetalleId.Value);
                    if (detalle != null)
                    {
                        detalle.Unicacion = request.Ubicacion;
                        detalle.ModificadoPor = userId;
                        detalle.ModificadoEn = DateTime.Now;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                sw.Stop();
                _logger.LogInformation("ProcessArchivar: Order #{OrderNumber} archived to stock at '{Ubicacion}' in {Elapsed}ms", 
                    orderNumber, request.Ubicacion, sw.ElapsedMilliseconds);

                return new ProcessArchivarResponse
                {
                    Success = true,
                    Message = "Equipo archivado - pasó a stock del negocio",
                    OrderNumber = orderNumber,
                    PreviousStatus = previousStatus,
                    NewStatus = ReparacionEstado.ARCHIVADO,
                    Ubicacion = request.Ubicacion,
                    NovedadId = novedad.NovedadId
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                sw.Stop();
                _logger.LogError(ex, "Error processing archivar for order #{OrderNumber} (elapsed {Elapsed}ms)", 
                    orderNumber, sw.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Get all active payment methods
        /// </summary>
        public async Task<List<MetodoPagoDto>> GetMetodosPagoAsync()
        {
            return await _context.MetodoPagos
                .OrderBy(m => m.Nombre)
                .Select(m => new MetodoPagoDto
                {
                    Id = m.MetodoPagoId,
                    Nombre = m.Nombre ?? "Sin nombre"
                })
                .ToListAsync();
        }

        /// <summary>
        /// Get movements/comments (Novedades) for an order.
        /// </summary>
        public async Task<List<OrderMovement>> GetOrderMovementsAsync(int orderNumber)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

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

        /// <summary>
        /// Creates a new repair order with customer, device, and detail information
        /// </summary>
        public async Task<OrderDetails> CreateOrderAsync(CreateOrderRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Find or create customer
                var customer = await FindOrCreateCustomerAsync(request.Customer);

                // 2. Create ReparacionDetalle first
                var detalle = new ReparacionDetalle
                {
                    EsGarantia = request.Garantia,
                    EsDomicilio = request.Domicilio,
                    Modelo = request.Device.Modelo,
                    Serie = request.Device.NroSerie,
                    Serbus = request.Device.SerBus,
                    Unicacion = request.Device.Ubicacion,
                    Accesorios = request.Device.Accesorios,
                    Presupuesto = ParseDecimalValue(request.Presupuesto),
                    Precio = ParseDecimalValue(request.MontoFinal),
                    FechoCompra = ParseDateValue(request.FechaCompra),
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1
                };
                _context.ReparacionDetalles.Add(detalle);
                await _context.SaveChangesAsync();

                // 3. Get next order number (Reparacion table does NOT use identity column)
                var nextOrderId = await GetNextOrderNumberAsync();

                // 4. Create Reparacion (main order)
                var reparacion = new Reparacion
                {
                    ReparacionId = nextOrderId, // Manually assign ID (not auto-generated)
                    ClienteId = customer.ClienteId,
                    EmpleadoAsignadoId = request.ResponsableId > 0 ? request.ResponsableId : 1,
                    TecnicoAsignadoId = request.TecnicoId > 0 ? request.TecnicoId : 1,
                    EstadoReparacionId = 1, // Initial state: "Ingresado"
                    ComercioId = request.Garantia && request.Comercio.ComercioId > 0 ? request.Comercio.ComercioId : null,
                    MarcaId = request.Device.MarcaId > 0 ? request.Device.MarcaId : 1,
                    TipoDispositivoId = request.Device.TipoId > 0 ? request.Device.TipoId : 1,
                    ReparacionDetalleId = detalle.ReparacionDetalleId,
                    CreadoEn = DateTime.Now,
                    CreadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1,
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1
                };
                _context.Reparacions.Add(reparacion);
                await _context.SaveChangesAsync();

                // 5. Create initial Novedad (INGRESO = 1) - mirrors baseline OrdenHelper behavior
                var novedad = new Novedad
                {
                    ReparacionId = reparacion.ReparacionId,
                    Monto = detalle.Presupuesto,
                    UserId = reparacion.TecnicoAsignadoId,
                    TipoNovedadId = 1, // INGRESO
                    Observacion = "Ingresado a sistema",
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1
                };
                _context.Novedads.Add(novedad);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Created order #{OrderNumber} for customer {CustomerName}", 
                    reparacion.ReparacionId, $"{customer.Nombre} {customer.Apellido}");

                // Return the created order details
                return await GetOrderDetailsAsync(reparacion.ReparacionId) 
                    ?? throw new InvalidOperationException("Failed to retrieve created order");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Failed to create order");
                throw;
            }
        }

        private async Task<Cliente> FindOrCreateCustomerAsync(CustomerData customerData)
        {
            // Try to find existing customer by DNI or ID
            Cliente? customer = null;
            
            if (customerData.ClienteId > 0)
            {
                customer = await _context.Clientes.FindAsync(customerData.ClienteId);
            }
            
            if (customer == null && !string.IsNullOrWhiteSpace(customerData.Dni) && int.TryParse(customerData.Dni, out var dniNum))
            {
                customer = await _context.Clientes.FirstOrDefaultAsync(c => c.Dni == dniNum);
            }

            if (customer != null)
            {
                // Update existing customer with new data
                customer.Nombre = customerData.FirstName;
                customer.Apellido = customerData.LastName;
                customer.Mail = customerData.Email;
                customer.Telefono1 = customerData.Phone;
                customer.Telefono2 = customerData.Celular;
                customer.Direccion = customerData.Direccion;
                customer.Localidad = customerData.Ciudad;
                
                // Validate coordinates are within valid ranges
                var validLat = ParseValidLatitude(customerData.Latitud);
                var validLng = ParseValidLongitude(customerData.Longitud);
                if (validLat.HasValue) customer.Latitud = (double)validLat.Value;
                if (validLng.HasValue) customer.Longitud = (double)validLng.Value;

                // Update or create address
                await UpdateCustomerAddressAsync(customer, customerData);
                
                await _context.SaveChangesAsync();
                return customer;
            }

            // Create new customer
            var validNewLat = ParseValidLatitude(customerData.Latitud);
            var validNewLng = ParseValidLongitude(customerData.Longitud);
            var newCustomer = new Cliente
            {
                Dni = int.TryParse(customerData.Dni, out var dni) ? dni : null,
                Nombre = customerData.FirstName,
                Apellido = customerData.LastName,
                Mail = customerData.Email,
                Telefono1 = customerData.Phone,
                Telefono2 = customerData.Celular,
                Direccion = customerData.Direccion,
                Localidad = customerData.Ciudad,
                Latitud = validNewLat.HasValue ? (double)validNewLat.Value : null,
                Longitud = validNewLng.HasValue ? (double)validNewLng.Value : null
            };

            _context.Clientes.Add(newCustomer);
            await _context.SaveChangesAsync();

            // Create address for new customer
            await UpdateCustomerAddressAsync(newCustomer, customerData);
            await _context.SaveChangesAsync();

            return newCustomer;
        }

        private async Task UpdateCustomerAddressAsync(Cliente customer, CustomerData customerData)
        {
            Direccion? address;
            
            if (customer.DireccionId.HasValue)
            {
                address = await _context.Direccions.FindAsync(customer.DireccionId.Value);
                if (address == null)
                {
                    address = new Direccion();
                    _context.Direccions.Add(address);
                }
            }
            else
            {
                address = new Direccion();
                _context.Direccions.Add(address);
            }

            address.Calle = customerData.Calle;
            address.Altura = customerData.Altura;
            address.Calle2 = customerData.EntreCalle1;
            address.Calle3 = customerData.EntreCalle2;
            address.Ciudad = customerData.Ciudad;
            address.CodigoPostal = customerData.CodigoPostal;
            address.Provincia = customerData.Provincia;
            address.Pais = customerData.Pais;
            // Validate coordinates are within valid ranges before saving
            address.Latitud = ParseValidLatitude(customerData.Latitud);
            address.Longitud = ParseValidLongitude(customerData.Longitud);
            address.ChangedOn = DateTime.Now;
            address.ChangedBy = 1;

            await _context.SaveChangesAsync();
            
            customer.DireccionId = address.DireccionId;
        }

        private static decimal? ParseDecimalValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return decimal.TryParse(value, out var result) ? result : null;
        }

        private static DateTime? ParseDateValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return DateTime.TryParse(value, out var result) ? result : null;
        }

        /// <summary>
        /// Parse and validate latitude value (must be between -90 and 90)
        /// </summary>
        private static decimal? ParseValidLatitude(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            // Use InvariantCulture to handle both comma and dot as decimal separator
            var normalizedValue = value.Replace(',', '.');
            if (decimal.TryParse(normalizedValue, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var result))
            {
                // Latitude must be between -90 and 90
                if (result >= -90m && result <= 90m)
                    return result;
            }
            return null;
        }

        /// <summary>
        /// Parse and validate longitude value (must be between -180 and 180)
        /// </summary>
        private static decimal? ParseValidLongitude(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            // Use InvariantCulture to handle both comma and dot as decimal separator
            var normalizedValue = value.Replace(',', '.');
            if (decimal.TryParse(normalizedValue, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var result))
            {
                // Longitude must be between -180 and 180
                if (result >= -180m && result <= 180m)
                    return result;
            }
            return null;
        }

        /// <summary>
        /// Gets the next available order number.
        /// The Reparacion table does NOT use an identity column for ReparacionId,
        /// so we must manually compute MAX(ReparacionId) + 1.
        /// This mirrors the baseline OrdenHelper.GetNextOrderNro() behavior.
        /// </summary>
        private async Task<int> GetNextOrderNumberAsync()
        {
            var maxId = await _context.Reparacions
                .Select(r => (int?)r.ReparacionId)
                .MaxAsync() ?? 0;
            return maxId + 1;
        }

        /// <summary>
        /// Updates an existing repair order with customer, device, and detail information
        /// </summary>
        public async Task<OrderDetails> UpdateOrderAsync(UpdateOrderRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Find existing order
                var reparacion = await _context.Reparacions
                    .Include(r => r.ReparacionDetalle)
                    .Include(r => r.Cliente)
                    .FirstOrDefaultAsync(r => r.ReparacionId == request.OrderNumber);

                if (reparacion == null)
                {
                    throw new InvalidOperationException($"Order #{request.OrderNumber} not found");
                }

                // 2. Update or find customer
                var customer = await FindOrCreateCustomerAsync(request.Customer);

                // 3. Update ReparacionDetalle
                if (reparacion.ReparacionDetalle != null)
                {
                    reparacion.ReparacionDetalle.EsGarantia = request.Garantia;
                    reparacion.ReparacionDetalle.EsDomicilio = request.Domicilio;
                    reparacion.ReparacionDetalle.Modelo = request.Device.Modelo;
                    reparacion.ReparacionDetalle.Serie = request.Device.NroSerie;
                    reparacion.ReparacionDetalle.Serbus = request.Device.SerBus;
                    reparacion.ReparacionDetalle.Unicacion = request.Device.Ubicacion;
                    reparacion.ReparacionDetalle.Accesorios = request.Device.Accesorios;
                    reparacion.ReparacionDetalle.Presupuesto = ParseDecimalValue(request.Presupuesto);
                    reparacion.ReparacionDetalle.Precio = ParseDecimalValue(request.MontoFinal);
                    reparacion.ReparacionDetalle.FechoCompra = ParseDateValue(request.FechaCompra);
                    reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                    reparacion.ReparacionDetalle.ModificadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1;
                }

                // 4. Update Reparacion (main order)
                reparacion.ClienteId = customer.ClienteId;
                reparacion.EmpleadoAsignadoId = request.ResponsableId > 0 ? request.ResponsableId : reparacion.EmpleadoAsignadoId;
                reparacion.TecnicoAsignadoId = request.TecnicoId > 0 ? request.TecnicoId : reparacion.TecnicoAsignadoId;
                reparacion.ComercioId = request.Garantia && request.Comercio.ComercioId > 0 ? request.Comercio.ComercioId : null;
                reparacion.MarcaId = request.Device.MarcaId > 0 ? request.Device.MarcaId : reparacion.MarcaId;
                reparacion.TipoDispositivoId = request.Device.TipoId > 0 ? request.Device.TipoId : reparacion.TipoDispositivoId;
                reparacion.ModificadoEn = DateTime.Now;
                reparacion.ModificadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1;

                await _context.SaveChangesAsync();

                // 5. Create modification Novedad
                var novedad = new Novedad
                {
                    ReparacionId = reparacion.ReparacionId,
                    Monto = reparacion.ReparacionDetalle?.Presupuesto,
                    UserId = reparacion.TecnicoAsignadoId,
                    TipoNovedadId = 5, // MODIFICACION
                    Observacion = "Orden modificada",
                    ModificadoEn = DateTime.Now,
                    ModificadoPor = request.ResponsableId > 0 ? request.ResponsableId : 1
                };
                _context.Novedads.Add(novedad);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Updated order #{OrderNumber} for customer {CustomerName}", 
                    reparacion.ReparacionId, $"{customer.Nombre} {customer.Apellido}");

                // Return the updated order details
                return await GetOrderDetailsAsync(reparacion.ReparacionId) 
                    ?? throw new InvalidOperationException("Failed to retrieve updated order");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Failed to update order #{OrderNumber}", request.OrderNumber);
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
    public int EstadoReparacionId { get; set; }
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

/// <summary>
/// Estado names matching baseline application
/// </summary>
public static class ReparacionEstado
{
    public const string RETIRADO = "RETIRADO";
    public const string PRESUPUESTADO = "PRESUPUESTADO";
    public const string REPARADO = "REPARADO";
    public const string INGRESADO = "INGRESADO";
    public const string RECHAZADO = "RECHAZADO";
    public const string RECHAZO_PRESUP = "RECHAZO PRESUP.";
    public const string PEND_RETIRO = "PEND. RETIRO";
    public const string ARCHIVADO = "ARCHIVADO";
}
