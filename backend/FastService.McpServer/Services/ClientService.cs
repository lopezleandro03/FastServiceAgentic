using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;

namespace FastService.McpServer.Services;

public class ClientService
{
    private readonly FastServiceDbContext _context;
    private readonly ILogger<ClientService> _logger;

    public ClientService(FastServiceDbContext context, ILogger<ClientService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of clients with optional filters
    /// </summary>
    public async Task<ClientsListResponse> GetClientsAsync(
        string? search = null,
        int pageNumber = 1,
        int pageSize = 20)
    {
        var query = _context.Clientes.AsNoTracking();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            var searchInt = int.TryParse(search, out var dniSearch) ? dniSearch : (int?)null;

            query = query.Where(c =>
                (searchInt.HasValue && c.Dni == searchInt) ||
                c.Nombre.ToLower().Contains(searchLower) ||
                c.Apellido.ToLower().Contains(searchLower) ||
                (c.Mail != null && c.Mail.ToLower().Contains(searchLower)) ||
                c.Direccion.ToLower().Contains(searchLower) ||
                (c.Telefono1 != null && c.Telefono1.Contains(search)));
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated results with order counts
        var clients = await query
            .OrderByDescending(c => c.ClienteId)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClientListItemDto
            {
                ClienteId = c.ClienteId,
                Dni = c.Dni,
                Nombre = c.Nombre,
                Apellido = c.Apellido,
                Email = c.Mail,
                Telefono = c.Telefono1,
                Celular = c.Telefono2,
                Direccion = c.Direccion,
                Localidad = c.Localidad,
                OrderCount = c.Reparacions.Count,
                LastOrderDate = c.Reparacions.Max(r => (DateTime?)r.CreadoEn)
            })
            .ToListAsync();

        return new ClientsListResponse
        {
            Clients = clients,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };
    }

    /// <summary>
    /// Get full client details including all orders
    /// </summary>
    public async Task<ClientDetailsDto?> GetClientDetailsAsync(int clienteId)
    {
        var client = await _context.Clientes
            .AsNoTracking()
            .Include(c => c.DireccionNavigation)
            .Include(c => c.Reparacions)
                .ThenInclude(r => r.EstadoReparacion)
            .Include(c => c.Reparacions)
                .ThenInclude(r => r.Marca)
            .Include(c => c.Reparacions)
                .ThenInclude(r => r.TipoDispositivo)
            .Include(c => c.Reparacions)
                .ThenInclude(r => r.ReparacionDetalle)
            .FirstOrDefaultAsync(c => c.ClienteId == clienteId);

        if (client == null)
            return null;

        var completedStatuses = new[] { "RETIRADO", "ENTREGADO" };
        var pendingOrders = client.Reparacions.Where(r => 
            r.EstadoReparacion != null && 
            !completedStatuses.Contains(r.EstadoReparacion.Nombre.ToUpper())).Count();
        var completedOrders = client.Reparacions.Count - pendingOrders;

        return new ClientDetailsDto
        {
            ClienteId = client.ClienteId,
            Dni = client.Dni,
            Nombre = client.Nombre,
            Apellido = client.Apellido,
            Email = client.Mail,
            Telefono = client.Telefono1,
            Celular = client.Telefono2,
            Direccion = client.Direccion,
            Localidad = client.Localidad,
            Latitud = client.Latitud,
            Longitud = client.Longitud,
            AddressDetails = client.DireccionNavigation != null ? new AddressDetailsDto
            {
                Calle = client.DireccionNavigation.Calle,
                Altura = client.DireccionNavigation.Altura,
                EntreCalle1 = client.DireccionNavigation.Calle2,
                EntreCalle2 = client.DireccionNavigation.Calle3,
                Ciudad = client.DireccionNavigation.Ciudad,
                CodigoPostal = client.DireccionNavigation.CodigoPostal,
                Provincia = client.DireccionNavigation.Provincia,
                Pais = client.DireccionNavigation.Pais
            } : null,
            Orders = client.Reparacions
                .OrderByDescending(r => r.CreadoEn)
                .Select(r => new ClientOrderSummaryDto
                {
                    OrderNumber = r.ReparacionId,
                    Status = r.EstadoReparacion?.Nombre ?? "Desconocido",
                    DeviceType = r.TipoDispositivo?.Nombre ?? "",
                    Brand = r.Marca?.Nombre ?? "",
                    Model = r.ReparacionDetalle?.Modelo,
                    CreatedAt = r.CreadoEn,
                    DeliveredAt = r.FechaEntrega,
                    FinalPrice = r.ReparacionDetalle?.Precio,
                    IsWarranty = r.ReparacionDetalle?.EsGarantia ?? false
                })
                .ToList(),
            Stats = new ClientStatsDto
            {
                TotalOrders = client.Reparacions.Count,
                CompletedOrders = completedOrders,
                PendingOrders = pendingOrders,
                TotalSpent = client.Reparacions
                    .Where(r => r.ReparacionDetalle?.Precio != null)
                    .Sum(r => r.ReparacionDetalle!.Precio ?? 0)
            }
        };
    }

    /// <summary>
    /// Search for client by DNI (for autocomplete in order creation)
    /// </summary>
    public async Task<ClientAutocompleteDto?> GetClientByDniAsync(string dni)
    {
        if (!int.TryParse(dni, out var dniNum))
            return null;

        var client = await _context.Clientes
            .AsNoTracking()
            .Include(c => c.DireccionNavigation)
            .FirstOrDefaultAsync(c => c.Dni == dniNum);

        if (client == null)
            return null;

        return new ClientAutocompleteDto
        {
            ClienteId = client.ClienteId,
            Dni = client.Dni,
            Nombre = client.Nombre,
            Apellido = client.Apellido,
            Email = client.Mail,
            Telefono = client.Telefono1,
            Celular = client.Telefono2,
            Direccion = client.Direccion,
            Localidad = client.Localidad,
            Latitud = client.Latitud,
            Longitud = client.Longitud,
            AddressDetails = client.DireccionNavigation != null ? new AddressDetailsDto
            {
                Calle = client.DireccionNavigation.Calle,
                Altura = client.DireccionNavigation.Altura,
                EntreCalle1 = client.DireccionNavigation.Calle2,
                EntreCalle2 = client.DireccionNavigation.Calle3,
                Ciudad = client.DireccionNavigation.Ciudad,
                CodigoPostal = client.DireccionNavigation.CodigoPostal,
                Provincia = client.DireccionNavigation.Provincia,
                Pais = client.DireccionNavigation.Pais
            } : null
        };
    }

    /// <summary>
    /// Search clients by prefix (for autocomplete suggestions)
    /// </summary>
    public async Task<List<ClientAutocompleteDto>> SearchClientsAsync(string prefix, int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(prefix))
            return new List<ClientAutocompleteDto>();

        var searchLower = prefix.ToLower();
        var searchInt = int.TryParse(prefix, out var dniSearch) ? dniSearch : (int?)null;

        IQueryable<Cliente> query = _context.Clientes
            .AsNoTracking()
            .Include(c => c.DireccionNavigation);

        // If it's a number, search by DNI
        if (searchInt.HasValue)
        {
            query = query.Where(c => c.Dni.HasValue && 
                c.Dni.Value.ToString().StartsWith(prefix));
        }
        else
        {
            // Otherwise search by name/surname
            query = query.Where(c =>
                c.Nombre.ToLower().Contains(searchLower) ||
                c.Apellido.ToLower().Contains(searchLower));
        }

        var clients = await query
            .OrderBy(c => c.Apellido)
            .ThenBy(c => c.Nombre)
            .Take(maxResults)
            .ToListAsync();

        return clients.Select(c => new ClientAutocompleteDto
        {
            ClienteId = c.ClienteId,
            Dni = c.Dni,
            Nombre = c.Nombre,
            Apellido = c.Apellido,
            Email = c.Mail,
            Telefono = c.Telefono1,
            Celular = c.Telefono2,
            Direccion = c.Direccion,
            Localidad = c.Localidad,
            Latitud = c.Latitud,
            Longitud = c.Longitud,
            AddressDetails = c.DireccionNavigation != null ? new AddressDetailsDto
            {
                Calle = c.DireccionNavigation.Calle,
                Altura = c.DireccionNavigation.Altura,
                EntreCalle1 = c.DireccionNavigation.Calle2,
                EntreCalle2 = c.DireccionNavigation.Calle3,
                Ciudad = c.DireccionNavigation.Ciudad,
                CodigoPostal = c.DireccionNavigation.CodigoPostal,
                Provincia = c.DireccionNavigation.Provincia,
                Pais = c.DireccionNavigation.Pais
            } : null
        }).ToList();
    }
}
