namespace FastService.McpServer.Dtos;

/// <summary>
/// DTO for client list view
/// </summary>
public class ClientListItemDto
{
    public int ClienteId { get; set; }
    public int? Dni { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Celular { get; set; }
    public string Direccion { get; set; } = string.Empty;
    public string? Localidad { get; set; }
    public int OrderCount { get; set; }
    public DateTime? LastOrderDate { get; set; }
}

/// <summary>
/// DTO for full client details including orders
/// </summary>
public class ClientDetailsDto
{
    public int ClienteId { get; set; }
    public int? Dni { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Celular { get; set; }
    public string Direccion { get; set; } = string.Empty;
    public string? Localidad { get; set; }
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public AddressDetailsDto? AddressDetails { get; set; }
    public List<ClientOrderSummaryDto> Orders { get; set; } = new();
    public ClientStatsDto Stats { get; set; } = new();
}

/// <summary>
/// Address details for a client
/// </summary>
public class AddressDetailsDto
{
    public string? Calle { get; set; }
    public string? Altura { get; set; }
    public string? EntreCalle1 { get; set; }
    public string? EntreCalle2 { get; set; }
    public string? Ciudad { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Provincia { get; set; }
    public string? Pais { get; set; }
}

/// <summary>
/// Summary of an order for client view
/// </summary>
public class ClientOrderSummaryDto
{
    public int OrderNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? Model { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public decimal? FinalPrice { get; set; }
    public bool IsWarranty { get; set; }
}

/// <summary>
/// Stats for a client
/// </summary>
public class ClientStatsDto
{
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalSpent { get; set; }
}

/// <summary>
/// Paginated response for clients list
/// </summary>
public class ClientsListResponse
{
    public List<ClientListItemDto> Clients { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

/// <summary>
/// DTO for DNI autocomplete response
/// </summary>
public class ClientAutocompleteDto
{
    public int ClienteId { get; set; }
    public int? Dni { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Celular { get; set; }
    public string Direccion { get; set; } = string.Empty;
    public string? Localidad { get; set; }
    public AddressDetailsDto? AddressDetails { get; set; }
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
}
