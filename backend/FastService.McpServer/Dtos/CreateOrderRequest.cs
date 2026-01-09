namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for creating a new repair order
/// </summary>
public class CreateOrderRequest
{
    public CustomerData Customer { get; set; } = new();
    public DeviceData Device { get; set; } = new();
    public ComercioData Comercio { get; set; } = new();
    public bool Garantia { get; set; }
    public bool Domicilio { get; set; }
    public string? Presupuesto { get; set; }
    public string? MontoFinal { get; set; }
    public int ResponsableId { get; set; }
    public int TecnicoId { get; set; }
    public string? FechaCompra { get; set; }
}

public class CustomerData
{
    public int ClienteId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Celular { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string Altura { get; set; } = string.Empty;
    public string EntreCalle1 { get; set; } = string.Empty;
    public string EntreCalle2 { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
    public string CodigoPostal { get; set; } = string.Empty;
    public string Provincia { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
    public string Latitud { get; set; } = string.Empty;
    public string Longitud { get; set; } = string.Empty;
}

public class DeviceData
{
    public int TipoId { get; set; }
    public int MarcaId { get; set; }
    public string Modelo { get; set; } = string.Empty;
    public string NroSerie { get; set; } = string.Empty;
    public string SerBus { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public string Accesorios { get; set; } = string.Empty;
}

public class ComercioData
{
    public int ComercioId { get; set; }
    public string Telefono { get; set; } = string.Empty;
}
