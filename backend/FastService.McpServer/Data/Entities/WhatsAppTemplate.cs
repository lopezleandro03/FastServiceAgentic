using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

/// <summary>
/// Represents a WhatsApp message template for different repair states.
/// Templates support placeholders that get replaced with order information.
/// </summary>
public partial class WhatsAppTemplate
{
    public int WhatsAppTemplateId { get; set; }

    /// <summary>
    /// The display name of this template (e.g., "Presupuestado", "Reparado", "Rechazado")
    /// </summary>
    public string Nombre { get; set; } = null!;

    /// <summary>
    /// Description of when to use this template
    /// </summary>
    public string? Descripcion { get; set; }

    /// <summary>
    /// The ID of the EstadoReparacion this template is linked to (nullable for custom templates like reminders)
    /// </summary>
    public int? EstadoReparacionId { get; set; }

    /// <summary>
    /// The template type: "estado" for state-based, "recordatorio" for reminders, "custom" for custom templates
    /// </summary>
    public string TipoTemplate { get; set; } = "estado";

    /// <summary>
    /// The message template with placeholders. Supported placeholders:
    /// {{ticket}} - Order/ticket number
    /// {{cliente}} - Customer first name
    /// {{cliente_completo}} - Customer full name
    /// {{presupuesto}} - Estimated price
    /// {{monto_final}} - Final price
    /// {{dispositivo}} - Device type
    /// {{marca}} - Device brand
    /// {{modelo}} - Device model
    /// {{fecha_ingreso}} - Entry date
    /// {{fecha_estado}} - Status change date
    /// {{ultima_novedad}} - Latest novedad observation
    /// {{reparacion}} - Latest repair description
    /// </summary>
    public string Mensaje { get; set; } = null!;

    /// <summary>
    /// Whether this template is active and can be used
    /// </summary>
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Display order for sorting templates in the UI
    /// </summary>
    public int Orden { get; set; } = 0;

    /// <summary>
    /// Whether this is the default template for its associated state
    /// </summary>
    public bool EsDefault { get; set; } = false;

    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    public int? CreadoPor { get; set; }

    public DateTime ModificadoEn { get; set; } = DateTime.UtcNow;

    public int? ModificadoPor { get; set; }

    // Navigation property
    public virtual EstadoReparacion? EstadoReparacion { get; set; }
}
