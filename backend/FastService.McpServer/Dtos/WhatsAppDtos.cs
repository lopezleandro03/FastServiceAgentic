namespace FastService.McpServer.Dtos;

/// <summary>
/// DTO for WhatsApp template display
/// </summary>
public class WhatsAppTemplateDto
{
    public int WhatsAppTemplateId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int? EstadoReparacionId { get; set; }
    public string? EstadoReparacionNombre { get; set; }
    public string TipoTemplate { get; set; } = "estado";
    public string Mensaje { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public int Orden { get; set; }
    public bool EsDefault { get; set; }
    public DateTime CreadoEn { get; set; }
    public DateTime ModificadoEn { get; set; }
}

/// <summary>
/// DTO for creating a new WhatsApp template
/// </summary>
public class WhatsAppTemplateCreateDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int? EstadoReparacionId { get; set; }
    public string? TipoTemplate { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public bool? Activo { get; set; }
    public int? Orden { get; set; }
    public bool? EsDefault { get; set; }
}

/// <summary>
/// DTO for updating an existing WhatsApp template
/// </summary>
public class WhatsAppTemplateUpdateDto
{
    public string? Nombre { get; set; }
    public string? Descripcion { get; set; }
    public int? EstadoReparacionId { get; set; }
    public string? TipoTemplate { get; set; }
    public string? Mensaje { get; set; }
    public bool? Activo { get; set; }
    public int? Orden { get; set; }
    public bool? EsDefault { get; set; }
}

/// <summary>
/// DTO for a generated WhatsApp message
/// </summary>
public class GeneratedMessageDto
{
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? WhatsAppUrl { get; set; }
    public int OrderNumber { get; set; }
    public string CustomerName { get; set; } = string.Empty;
}

/// <summary>
/// DTO for template placeholders info
/// </summary>
public class PlaceholderInfoDto
{
    public string Placeholder { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
