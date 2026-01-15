using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;
using System.Text.RegularExpressions;

namespace FastService.McpServer.Services;

/// <summary>
/// Service for managing WhatsApp message templates and generating messages.
/// </summary>
public class WhatsAppService
{
    private readonly FastServiceDbContext _db;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(FastServiceDbContext db, ILogger<WhatsAppService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Get all active templates
    /// </summary>
    public async Task<List<WhatsAppTemplateDto>> GetAllTemplatesAsync()
    {
        var templates = await _db.WhatsAppTemplates
            .Include(t => t.EstadoReparacion)
            .Where(t => t.Activo)
            .OrderBy(t => t.Orden)
            .ThenBy(t => t.Nombre)
            .ToListAsync();

        return templates.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Get all templates including inactive ones (for admin)
    /// </summary>
    public async Task<List<WhatsAppTemplateDto>> GetAllTemplatesAdminAsync()
    {
        var templates = await _db.WhatsAppTemplates
            .Include(t => t.EstadoReparacion)
            .OrderBy(t => t.Orden)
            .ThenBy(t => t.Nombre)
            .ToListAsync();

        return templates.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Get template by ID
    /// </summary>
    public async Task<WhatsAppTemplateDto?> GetTemplateByIdAsync(int templateId)
    {
        var template = await _db.WhatsAppTemplates
            .Include(t => t.EstadoReparacion)
            .FirstOrDefaultAsync(t => t.WhatsAppTemplateId == templateId);

        return template != null ? MapToDto(template) : null;
    }

    /// <summary>
    /// Get templates for a specific repair state
    /// </summary>
    public async Task<List<WhatsAppTemplateDto>> GetTemplatesForStateAsync(int estadoReparacionId)
    {
        var templates = await _db.WhatsAppTemplates
            .Include(t => t.EstadoReparacion)
            .Where(t => t.Activo && t.EstadoReparacionId == estadoReparacionId)
            .OrderBy(t => t.EsDefault ? 0 : 1)
            .ThenBy(t => t.Orden)
            .ToListAsync();

        return templates.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Get the default template for a specific repair state
    /// </summary>
    public async Task<WhatsAppTemplateDto?> GetDefaultTemplateForStateAsync(int estadoReparacionId)
    {
        var template = await _db.WhatsAppTemplates
            .Include(t => t.EstadoReparacion)
            .Where(t => t.Activo && t.EstadoReparacionId == estadoReparacionId && t.EsDefault)
            .FirstOrDefaultAsync();

        if (template == null)
        {
            // Fall back to any active template for this state
            template = await _db.WhatsAppTemplates
                .Include(t => t.EstadoReparacion)
                .Where(t => t.Activo && t.EstadoReparacionId == estadoReparacionId)
                .OrderBy(t => t.Orden)
                .FirstOrDefaultAsync();
        }

        return template != null ? MapToDto(template) : null;
    }

    /// <summary>
    /// Get reminder templates
    /// </summary>
    public async Task<List<WhatsAppTemplateDto>> GetReminderTemplatesAsync()
    {
        var templates = await _db.WhatsAppTemplates
            .Include(t => t.EstadoReparacion)
            .Where(t => t.Activo && t.TipoTemplate == "recordatorio")
            .OrderBy(t => t.EsDefault ? 0 : 1)
            .ThenBy(t => t.Orden)
            .ToListAsync();

        return templates.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Create a new template
    /// </summary>
    public async Task<WhatsAppTemplateDto> CreateTemplateAsync(WhatsAppTemplateCreateDto dto, int? userId = null)
    {
        var template = new WhatsAppTemplate
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            EstadoReparacionId = dto.EstadoReparacionId,
            TipoTemplate = dto.TipoTemplate ?? "estado",
            Mensaje = dto.Mensaje,
            Activo = dto.Activo ?? true,
            Orden = dto.Orden ?? 0,
            EsDefault = dto.EsDefault ?? false,
            CreadoEn = DateTime.UtcNow,
            CreadoPor = userId,
            ModificadoEn = DateTime.UtcNow,
            ModificadoPor = userId
        };

        // If this is set as default, unset other defaults for the same state
        if (template.EsDefault && template.EstadoReparacionId.HasValue)
        {
            await UnsetOtherDefaultsAsync(template.EstadoReparacionId.Value, template.TipoTemplate, 0);
        }

        _db.WhatsAppTemplates.Add(template);
        await _db.SaveChangesAsync();

        // Reload with navigation property
        await _db.Entry(template).Reference(t => t.EstadoReparacion).LoadAsync();

        _logger.LogInformation("Created WhatsApp template {TemplateId}: {TemplateName}", template.WhatsAppTemplateId, template.Nombre);

        return MapToDto(template);
    }

    /// <summary>
    /// Update an existing template
    /// </summary>
    public async Task<WhatsAppTemplateDto?> UpdateTemplateAsync(int templateId, WhatsAppTemplateUpdateDto dto, int? userId = null)
    {
        var template = await _db.WhatsAppTemplates.FindAsync(templateId);
        if (template == null)
        {
            return null;
        }

        if (dto.Nombre != null) template.Nombre = dto.Nombre;
        if (dto.Descripcion != null) template.Descripcion = dto.Descripcion;
        if (dto.EstadoReparacionId.HasValue) template.EstadoReparacionId = dto.EstadoReparacionId.Value == 0 ? null : dto.EstadoReparacionId;
        if (dto.TipoTemplate != null) template.TipoTemplate = dto.TipoTemplate;
        if (dto.Mensaje != null) template.Mensaje = dto.Mensaje;
        if (dto.Activo.HasValue) template.Activo = dto.Activo.Value;
        if (dto.Orden.HasValue) template.Orden = dto.Orden.Value;
        if (dto.EsDefault.HasValue)
        {
            template.EsDefault = dto.EsDefault.Value;
            // If this is set as default, unset other defaults for the same state
            if (template.EsDefault && template.EstadoReparacionId.HasValue)
            {
                await UnsetOtherDefaultsAsync(template.EstadoReparacionId.Value, template.TipoTemplate, templateId);
            }
        }

        template.ModificadoEn = DateTime.UtcNow;
        template.ModificadoPor = userId;

        await _db.SaveChangesAsync();

        // Reload with navigation property
        await _db.Entry(template).Reference(t => t.EstadoReparacion).LoadAsync();

        _logger.LogInformation("Updated WhatsApp template {TemplateId}: {TemplateName}", template.WhatsAppTemplateId, template.Nombre);

        return MapToDto(template);
    }

    /// <summary>
    /// Delete a template
    /// </summary>
    public async Task<bool> DeleteTemplateAsync(int templateId)
    {
        var template = await _db.WhatsAppTemplates.FindAsync(templateId);
        if (template == null)
        {
            return false;
        }

        _db.WhatsAppTemplates.Remove(template);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Deleted WhatsApp template {TemplateId}: {TemplateName}", templateId, template.Nombre);

        return true;
    }

    /// <summary>
    /// Generate a message from a template with order data
    /// </summary>
    public async Task<GeneratedMessageDto> GenerateMessageAsync(int templateId, int orderNumber)
    {
        var template = await _db.WhatsAppTemplates.FindAsync(templateId);
        if (template == null)
        {
            throw new ArgumentException($"Template with ID {templateId} not found");
        }

        return await GenerateMessageFromTemplateAsync(template, orderNumber);
    }

    /// <summary>
    /// Generate a message for a specific state using the default template
    /// </summary>
    public async Task<GeneratedMessageDto?> GenerateMessageForStateAsync(int orderNumber, int estadoReparacionId)
    {
        var template = await _db.WhatsAppTemplates
            .Where(t => t.Activo && t.EstadoReparacionId == estadoReparacionId && t.EsDefault)
            .FirstOrDefaultAsync();

        if (template == null)
        {
            template = await _db.WhatsAppTemplates
                .Where(t => t.Activo && t.EstadoReparacionId == estadoReparacionId)
                .OrderBy(t => t.Orden)
                .FirstOrDefaultAsync();
        }

        if (template == null)
        {
            return null;
        }

        return await GenerateMessageFromTemplateAsync(template, orderNumber);
    }

    /// <summary>
    /// Get available template placeholders with descriptions
    /// </summary>
    public static Dictionary<string, string> GetAvailablePlaceholders()
    {
        return new Dictionary<string, string>
        {
            { "{{ticket}}", "Número de ticket/orden" },
            { "{{cliente}}", "Nombre del cliente" },
            { "{{cliente_completo}}", "Nombre completo del cliente" },
            { "{{presupuesto}}", "Monto del presupuesto" },
            { "{{monto_final}}", "Monto final" },
            { "{{dispositivo}}", "Tipo de dispositivo" },
            { "{{marca}}", "Marca del dispositivo" },
            { "{{modelo}}", "Modelo del dispositivo" },
            { "{{fecha_ingreso}}", "Fecha de ingreso" },
            { "{{fecha_estado}}", "Fecha del último cambio de estado" },
            { "{{ultima_novedad}}", "Última novedad/observación" },
            { "{{reparacion}}", "Descripción de la reparación" }
        };
    }

    private async Task<GeneratedMessageDto> GenerateMessageFromTemplateAsync(WhatsAppTemplate template, int orderNumber)
    {
        // Fetch order data with all needed relationships
        var reparacion = await _db.Reparacions
            .Include(r => r.Cliente)
            .Include(r => r.EstadoReparacion)
            .Include(r => r.Marca)
            .Include(r => r.TipoDispositivo)
            .Include(r => r.ReparacionDetalle)
            .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

        if (reparacion == null)
        {
            throw new ArgumentException($"Order with number {orderNumber} not found");
        }

        // Get latest novedad
        var ultimaNovedad = await _db.Novedads
            .Where(n => n.ReparacionId == orderNumber)
            .OrderByDescending(n => n.ModificadoEn)
            .FirstOrDefaultAsync();

        // Build replacement dictionary
        var replacements = new Dictionary<string, string>
        {
            { "{{ticket}}", orderNumber.ToString() },
            { "{{cliente}}", reparacion.Cliente?.Nombre ?? "Cliente" },
            { "{{cliente_completo}}", $"{reparacion.Cliente?.Nombre} {reparacion.Cliente?.Apellido}".Trim() },
            { "{{presupuesto}}", reparacion.ReparacionDetalle?.Presupuesto?.ToString("C", new System.Globalization.CultureInfo("es-AR")) ?? "N/A" },
            { "{{monto_final}}", reparacion.ReparacionDetalle?.Precio?.ToString("C", new System.Globalization.CultureInfo("es-AR")) ?? "N/A" },
            { "{{dispositivo}}", reparacion.TipoDispositivo?.Nombre ?? "N/A" },
            { "{{marca}}", reparacion.Marca?.Nombre ?? "N/A" },
            { "{{modelo}}", reparacion.ReparacionDetalle?.Modelo ?? "N/A" },
            { "{{fecha_ingreso}}", reparacion.CreadoEn.ToString("dd/MM/yyyy") },
            { "{{fecha_estado}}", reparacion.ModificadoEn.ToString("dd/MM/yyyy") },
            { "{{ultima_novedad}}", ultimaNovedad?.Observacion ?? "sin novedades" },
            { "{{reparacion}}", reparacion.ReparacionDetalle?.ReparacionDesc ?? "N/A" }
        };

        // Replace placeholders in message
        var message = template.Mensaje;
        foreach (var replacement in replacements)
        {
            message = message.Replace(replacement.Key, replacement.Value);
        }

        // Format phone number
        var phone = reparacion.Cliente?.Telefono2 ?? reparacion.Cliente?.Telefono1;
        var formattedPhone = FormatPhoneForWhatsApp(phone);

        return new GeneratedMessageDto
        {
            TemplateId = template.WhatsAppTemplateId,
            TemplateName = template.Nombre,
            Message = message,
            PhoneNumber = formattedPhone,
            WhatsAppUrl = !string.IsNullOrEmpty(formattedPhone) 
                ? $"https://wa.me/{formattedPhone}?text={Uri.EscapeDataString(message)}"
                : null,
            OrderNumber = orderNumber,
            CustomerName = $"{reparacion.Cliente?.Nombre} {reparacion.Cliente?.Apellido}".Trim()
        };
    }

    private static string? FormatPhoneForWhatsApp(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return null;
        }

        // Remove all non-numeric characters
        var cleaned = Regex.Replace(phone, @"\D", "");

        // If starts with 0, remove it (Argentina local format)
        if (cleaned.StartsWith("0"))
        {
            cleaned = cleaned.Substring(1);
        }

        // If doesn't have country code, add Argentina's code (54)
        if (!cleaned.StartsWith("54"))
        {
            cleaned = "54" + cleaned;
        }

        return cleaned;
    }

    private async Task UnsetOtherDefaultsAsync(int estadoReparacionId, string tipoTemplate, int exceptTemplateId)
    {
        var otherDefaults = await _db.WhatsAppTemplates
            .Where(t => t.EstadoReparacionId == estadoReparacionId 
                && t.TipoTemplate == tipoTemplate 
                && t.EsDefault 
                && t.WhatsAppTemplateId != exceptTemplateId)
            .ToListAsync();

        foreach (var t in otherDefaults)
        {
            t.EsDefault = false;
        }
    }

    private static WhatsAppTemplateDto MapToDto(WhatsAppTemplate template)
    {
        return new WhatsAppTemplateDto
        {
            WhatsAppTemplateId = template.WhatsAppTemplateId,
            Nombre = template.Nombre,
            Descripcion = template.Descripcion,
            EstadoReparacionId = template.EstadoReparacionId,
            EstadoReparacionNombre = template.EstadoReparacion?.Nombre,
            TipoTemplate = template.TipoTemplate,
            Mensaje = template.Mensaje,
            Activo = template.Activo,
            Orden = template.Orden,
            EsDefault = template.EsDefault,
            CreadoEn = template.CreadoEn,
            ModificadoEn = template.ModificadoEn
        };
    }
}
