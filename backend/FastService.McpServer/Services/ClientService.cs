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
    /// Search clients by name with fuzzy matching support.
    /// Supports partial matches and typo tolerance.
    /// Results ordered by match quality, then by last order date (most recent first).
    /// OPTIMIZED: Uses SQL projection to avoid loading all orders.
    /// </summary>
    public async Task<List<ClientSearchResultDto>> SearchClientsFuzzyAsync(string searchTerm, int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<ClientSearchResultDto>();

        var searchLower = searchTerm.ToLower().Trim();
        var searchParts = searchLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var searchInt = int.TryParse(searchTerm, out var dniSearch) ? dniSearch : (int?)null;

        // Use projection query - don't load full entities or all orders
        IQueryable<Cliente> baseQuery = _context.Clientes.AsNoTracking();

        // Apply basic filter that SQL can handle
        if (searchInt.HasValue)
        {
            // DNI search - get exact match
            baseQuery = baseQuery.Where(c => c.Dni == searchInt);
        }
        else if (searchParts.Length == 1)
        {
            // Single term - search in name or surname
            var term = searchParts[0];
            baseQuery = baseQuery.Where(c =>
                c.Nombre.ToLower().Contains(term) ||
                c.Apellido.ToLower().Contains(term));
        }
        else if (searchParts.Length == 2)
        {
            // Two terms - common "nombre apellido" pattern
            var part1 = searchParts[0];
            var part2 = searchParts[1];
            baseQuery = baseQuery.Where(c =>
                // Match "nombre apellido" order
                (c.Nombre.ToLower().Contains(part1) && c.Apellido.ToLower().Contains(part2)) ||
                // Or reversed "apellido nombre"
                (c.Nombre.ToLower().Contains(part2) && c.Apellido.ToLower().Contains(part1)) ||
                // Or any part matches anywhere
                c.Nombre.ToLower().Contains(part1) ||
                c.Apellido.ToLower().Contains(part1) ||
                c.Nombre.ToLower().Contains(part2) ||
                c.Apellido.ToLower().Contains(part2));
        }
        else
        {
            // Multiple terms - fallback to full search term
            baseQuery = baseQuery.Where(c =>
                c.Nombre.ToLower().Contains(searchLower) ||
                c.Apellido.ToLower().Contains(searchLower));
        }

        // Project to lightweight DTO in SQL - avoids loading all orders
        var candidates = await baseQuery
            .Take(maxResults * 3) // Get candidates for fuzzy ranking (reduced from 5x)
            .Select(c => new
            {
                c.ClienteId,
                c.Dni,
                c.Nombre,
                c.Apellido,
                c.Mail,
                c.Telefono1,
                c.Telefono2,
                c.Direccion,
                c.Localidad,
                // Count orders in SQL, don't load them
                OrderCount = c.Reparacions.Count,
                // Get last order date in SQL
                LastOrderDate = c.Reparacions.Max(r => (DateTime?)r.CreadoEn)
            })
            .ToListAsync();

        // Apply fuzzy ranking in memory (now on lightweight DTOs)
        var rankedResults = candidates
            .Select(c => new
            {
                Client = c,
                Score = CalculateFuzzyScore(c.Nombre, c.Apellido, searchParts)
            })
            .Where(x => x.Score > 0) // Only include matches with positive score
            .OrderByDescending(x => x.Score) // Best matches first
            .ThenByDescending(x => x.Client.LastOrderDate) // Then by last order date
            .Take(maxResults)
            .ToList();

        return rankedResults.Select(x => new ClientSearchResultDto
        {
            ClienteId = x.Client.ClienteId,
            Dni = x.Client.Dni,
            Nombre = x.Client.Nombre,
            Apellido = x.Client.Apellido,
            FullName = $"{x.Client.Nombre} {x.Client.Apellido}".Trim(),
            Email = x.Client.Mail,
            Telefono = x.Client.Telefono1,
            Celular = x.Client.Telefono2,
            Direccion = x.Client.Direccion,
            Localidad = x.Client.Localidad,
            OrderCount = x.Client.OrderCount,
            LastOrderDate = x.Client.LastOrderDate,
            MatchScore = x.Score
        }).ToList();
    }

    /// <summary>
    /// Calculate fuzzy match score between search terms and client name/surname.
    /// Higher score = better match.
    /// </summary>
    private double CalculateFuzzyScore(string nombre, string apellido, string[] searchParts)
    {
        double totalScore = 0;
        var nombreLower = nombre?.ToLower() ?? "";
        var apellidoLower = apellido?.ToLower() ?? "";
        var fullName = $"{nombreLower} {apellidoLower}".Trim();

        foreach (var part in searchParts)
        {
            double partScore = 0;

            // Exact match gets highest score
            if (nombreLower == part || apellidoLower == part)
            {
                partScore = 100;
            }
            // Starts with gets high score
            else if (nombreLower.StartsWith(part) || apellidoLower.StartsWith(part))
            {
                partScore = 80;
            }
            // Contains gets medium score
            else if (nombreLower.Contains(part) || apellidoLower.Contains(part))
            {
                partScore = 60;
            }
            // Levenshtein distance for fuzzy matching (typo tolerance)
            // Only compute if the search part is reasonably sized
            else if (part.Length >= 2 && part.Length <= 15)
            {
                var maxAllowedDist = part.Length <= 4 ? 2 : 3;
                var distNombre = LevenshteinDistanceWithLimit(nombreLower, part, maxAllowedDist);
                var distApellido = LevenshteinDistanceWithLimit(apellidoLower, part, maxAllowedDist);
                var minDist = Math.Min(distNombre, distApellido);
                
                if (minDist <= maxAllowedDist)
                {
                    // Score decreases with distance
                    partScore = Math.Max(0, 40 - (minDist * 15));
                }
            }

            totalScore += partScore;
        }

        return totalScore / searchParts.Length; // Normalize by number of search parts
    }

    /// <summary>
    /// Compute Levenshtein distance between two strings with early termination.
    /// Returns maxDistance + 1 if the actual distance exceeds maxDistance.
    /// Uses optimized single-row algorithm with O(m) space.
    /// </summary>
    private int LevenshteinDistanceWithLimit(string s, string t, int maxDistance)
    {
        if (string.IsNullOrEmpty(s)) return t?.Length ?? 0;
        if (string.IsNullOrEmpty(t)) return s.Length;

        // Early termination if length difference exceeds max distance
        if (Math.Abs(s.Length - t.Length) > maxDistance)
            return maxDistance + 1;

        int n = s.Length;
        int m = t.Length;

        // Use single-row optimization - O(m) space instead of O(n*m)
        int[] prev = new int[m + 1];
        int[] curr = new int[m + 1];

        for (int j = 0; j <= m; j++) prev[j] = j;

        for (int i = 1; i <= n; i++)
        {
            curr[0] = i;
            int minInRow = curr[0];

            for (int j = 1; j <= m; j++)
            {
                int cost = s[i - 1] == t[j - 1] ? 0 : 1;
                curr[j] = Math.Min(
                    Math.Min(prev[j] + 1, curr[j - 1] + 1),
                    prev[j - 1] + cost);
                
                if (curr[j] < minInRow) minInRow = curr[j];
            }

            // Early termination if all values in current row exceed maxDistance
            if (minInRow > maxDistance)
                return maxDistance + 1;

            // Swap rows
            (prev, curr) = (curr, prev);
        }

        return prev[m];
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
