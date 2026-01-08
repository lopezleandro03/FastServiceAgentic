using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;

namespace FastService.McpServer.Services
{
    public class OrderService
    {
        private readonly FastServiceDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(FastServiceDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
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
            try
            {
                var order = await _context.Reparacions
                    .Include(r => r.Cliente)
                    .Include(r => r.TecnicoAsignado)
                    .Include(r => r.EstadoReparacion)
                    .Include(r => r.Marca)
                    .Include(r => r.TipoDispositivo)
                    .Include(r => r.ReparacionDetalle)
                    .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

                if (order == null)
                    return null;

                return new OrderDetails
                {
                    OrderNumber = order.ReparacionId,
                    Customer = new CustomerInfo
                    {
                        CustomerId = order.ClienteId,
                        FullName = $"{order.Cliente!.Nombre} {order.Cliente.Apellido}",
                        DNI = order.Cliente.Dni?.ToString(),
                        Email = order.Cliente.Mail,
                        Phone = order.Cliente.Telefono1,
                        Address = order.Cliente.Direccion
                    },
                    Device = new DeviceInfo
                    {
                        Brand = order.Marca!.Nombre,
                        DeviceType = order.TipoDispositivo!.Nombre,
                        SerialNumber = null // Not available in current schema
                    },
                    Repair = new RepairInfo
                    {
                        Status = order.EstadoReparacion!.Nombre,
                        Observations = null, // Not available in current schema
                        EntryDate = order.CreadoEn.ToString("yyyy-MM-dd"),
                        ExitDate = order.FechaEntrega?.ToString("yyyy-MM-dd"),
                        EstimatedDeliveryDate = order.FechaEntrega?.ToString("yyyy-MM-dd"),
                        EstimatedPrice = null,
                        FinalPrice = null,
                        UnderWarranty = false
                    },
                    Technician = new UserInfo
                    {
                        UserId = order.TecnicoAsignadoId,
                        FullName = $"{order.TecnicoAsignado!.Nombre} {order.TecnicoAsignado.Apellido}".Trim(),
                        Email = order.TecnicoAsignado.Email,
                        Phone = order.TecnicoAsignado.Telefono1
                    },
                    Details = new List<RepairDetailInfo>() // Will be populated when we have detail records
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order details for order: {OrderNumber}", orderNumber);
                throw;
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
    }
}
