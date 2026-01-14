using FastService.McpServer.Data;
using FastService.McpServer.Services;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace FastService.McpServer.Tools;

/// <summary>
/// MCP Tools for updating order fields via AI conversation.
/// These tools allow the AI to make targeted updates to orders
/// based on natural language requests like "Actualiza teléfono a xxxxx".
/// </summary>
[McpServerToolType]
public class OrderUpdateTools
{
    private readonly FastServiceDbContext _context;
    private readonly OrderService _orderService;
    private readonly ILogger<OrderUpdateTools> _logger;

    public OrderUpdateTools(FastServiceDbContext context, OrderService orderService, ILogger<OrderUpdateTools> logger)
    {
        _context = context;
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Update a specific field of an existing order.
    /// Supports updating customer contact info and device details.
    /// </summary>
    [McpServerTool(Name = "UpdateOrderField")]
    [Description(@"Update a specific field of an existing order. Use when the user wants to modify a single field.
Supported fields:
- Customer: 'telefono', 'telefono2', 'email', 'direccion', 'localidad'
- Device: 'modelo', 'serie', 'accesorios', 'ubicacion'
- Order: 'presupuesto', 'precio'
Example: User says 'Actualiza teléfono a 1155667788' -> field='telefono', newValue='1155667788'")]
    public async Task<string> UpdateOrderFieldAsync(
        [Description("Order number to update")] int orderNumber,
        [Description("Field to update: 'telefono', 'telefono2', 'email', 'direccion', 'localidad', 'modelo', 'serie', 'accesorios', 'ubicacion', 'presupuesto', 'precio'")] string field,
        [Description("New value for the field")] string newValue)
    {
        try
        {
            _logger.LogInformation("Updating field '{Field}' to '{Value}' for order #{OrderNumber}", field, newValue, orderNumber);

            // Get the order with related entities
            var reparacion = await _context.Reparacions
                .Include(r => r.Cliente)
                .Include(r => r.ReparacionDetalle)
                .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

            if (reparacion == null)
            {
                return ToolResponseHelper.NotFound("order", new { orderNumber });
            }

            var fieldLower = field.ToLowerInvariant().Trim();
            string updatedField = "";
            string oldValue = "";

            // Customer fields
            switch (fieldLower)
            {
                case "telefono":
                case "telefono1":
                case "phone":
                case "cel":
                case "celular":
                    oldValue = reparacion.Cliente.Telefono1 ?? "";
                    reparacion.Cliente.Telefono1 = newValue;
                    updatedField = "teléfono";
                    break;

                case "telefono2":
                case "phone2":
                case "tel2":
                    oldValue = reparacion.Cliente.Telefono2 ?? "";
                    reparacion.Cliente.Telefono2 = newValue;
                    updatedField = "teléfono secundario";
                    break;

                case "email":
                case "mail":
                case "correo":
                    oldValue = reparacion.Cliente.Mail ?? "";
                    reparacion.Cliente.Mail = newValue;
                    updatedField = "email";
                    break;

                case "direccion":
                case "domicilio":
                case "address":
                    oldValue = reparacion.Cliente.Direccion ?? "";
                    reparacion.Cliente.Direccion = newValue;
                    updatedField = "dirección";
                    break;

                case "localidad":
                case "ciudad":
                case "city":
                    oldValue = reparacion.Cliente.Localidad ?? "";
                    reparacion.Cliente.Localidad = newValue;
                    updatedField = "localidad";
                    break;

                // Device fields
                case "modelo":
                case "model":
                    if (reparacion.ReparacionDetalle != null)
                    {
                        oldValue = reparacion.ReparacionDetalle.Modelo ?? "";
                        reparacion.ReparacionDetalle.Modelo = newValue;
                        reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                        updatedField = "modelo";
                    }
                    else
                    {
                        return ToolResponseHelper.Error("No se puede actualizar el modelo: la orden no tiene detalles", new { orderNumber });
                    }
                    break;

                case "serie":
                case "serial":
                case "nroserie":
                    if (reparacion.ReparacionDetalle != null)
                    {
                        oldValue = reparacion.ReparacionDetalle.Serie ?? "";
                        reparacion.ReparacionDetalle.Serie = newValue;
                        reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                        updatedField = "número de serie";
                    }
                    else
                    {
                        return ToolResponseHelper.Error("No se puede actualizar la serie: la orden no tiene detalles", new { orderNumber });
                    }
                    break;

                case "accesorios":
                case "accessories":
                    if (reparacion.ReparacionDetalle != null)
                    {
                        oldValue = reparacion.ReparacionDetalle.Accesorios ?? "";
                        reparacion.ReparacionDetalle.Accesorios = newValue;
                        reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                        updatedField = "accesorios";
                    }
                    else
                    {
                        return ToolResponseHelper.Error("No se puede actualizar accesorios: la orden no tiene detalles", new { orderNumber });
                    }
                    break;

                case "ubicacion":
                case "location":
                    if (reparacion.ReparacionDetalle != null)
                    {
                        oldValue = reparacion.ReparacionDetalle.Unicacion ?? "";
                        reparacion.ReparacionDetalle.Unicacion = newValue;
                        reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                        updatedField = "ubicación";
                    }
                    else
                    {
                        return ToolResponseHelper.Error("No se puede actualizar ubicación: la orden no tiene detalles", new { orderNumber });
                    }
                    break;

                case "presupuesto":
                case "budget":
                    if (reparacion.ReparacionDetalle != null)
                    {
                        oldValue = reparacion.ReparacionDetalle.Presupuesto?.ToString("N2") ?? "0";
                        if (decimal.TryParse(newValue.Replace("$", "").Replace(",", ".").Trim(), out var presupuesto))
                        {
                            reparacion.ReparacionDetalle.Presupuesto = presupuesto;
                            reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                            updatedField = "presupuesto";
                        }
                        else
                        {
                            return ToolResponseHelper.Error($"Valor de presupuesto inválido: '{newValue}'", new { orderNumber, field });
                        }
                    }
                    else
                    {
                        return ToolResponseHelper.Error("No se puede actualizar presupuesto: la orden no tiene detalles", new { orderNumber });
                    }
                    break;

                case "precio":
                case "monto":
                case "price":
                    if (reparacion.ReparacionDetalle != null)
                    {
                        oldValue = reparacion.ReparacionDetalle.Precio?.ToString("N2") ?? "0";
                        if (decimal.TryParse(newValue.Replace("$", "").Replace(",", ".").Trim(), out var precio))
                        {
                            reparacion.ReparacionDetalle.Precio = precio;
                            reparacion.ReparacionDetalle.ModificadoEn = DateTime.Now;
                            updatedField = "precio";
                        }
                        else
                        {
                            return ToolResponseHelper.Error($"Valor de precio inválido: '{newValue}'", new { orderNumber, field });
                        }
                    }
                    else
                    {
                        return ToolResponseHelper.Error("No se puede actualizar precio: la orden no tiene detalles", new { orderNumber });
                    }
                    break;

                default:
                    return ToolResponseHelper.Error(
                        $"Campo '{field}' no reconocido. Campos válidos: telefono, telefono2, email, direccion, localidad, modelo, serie, accesorios, ubicacion, presupuesto, precio",
                        new { orderNumber, field });
            }

            // Update modification timestamp
            reparacion.ModificadoEn = DateTime.Now;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated {Field} for order #{OrderNumber}: '{OldValue}' -> '{NewValue}'", 
                updatedField, orderNumber, oldValue, newValue);

            // Return updated order details
            var updatedOrder = await _orderService.GetOrderDetailsAsync(orderNumber);

            return ToolResponseHelper.Success(new
            {
                orderNumber,
                updatedField,
                oldValue,
                newValue,
                order = updatedOrder
            }, $"✅ {char.ToUpper(updatedField[0]) + updatedField[1..]} actualizado exitosamente de '{oldValue}' a '{newValue}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating field '{Field}' for order #{OrderNumber}", field, orderNumber);
            return ToolResponseHelper.Error($"Error al actualizar: {ex.Message}", new { orderNumber, field });
        }
    }

    /// <summary>
    /// Update multiple customer contact fields at once.
    /// </summary>
    [McpServerTool(Name = "UpdateCustomerInfo")]
    [Description("Update customer contact information for an order. Use when the user wants to update multiple contact fields at once.")]
    public async Task<string> UpdateCustomerInfoAsync(
        [Description("Order number")] int orderNumber,
        [Description("Primary phone number (optional, pass empty string to skip)")] string? telefono = null,
        [Description("Secondary phone number (optional)")] string? telefono2 = null,
        [Description("Email address (optional)")] string? email = null,
        [Description("Address (optional)")] string? direccion = null,
        [Description("City/locality (optional)")] string? localidad = null)
    {
        try
        {
            _logger.LogInformation("Updating customer info for order #{OrderNumber}", orderNumber);

            var reparacion = await _context.Reparacions
                .Include(r => r.Cliente)
                .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

            if (reparacion == null)
            {
                return ToolResponseHelper.NotFound("order", new { orderNumber });
            }

            var updates = new List<string>();

            if (!string.IsNullOrWhiteSpace(telefono))
            {
                var old = reparacion.Cliente.Telefono1;
                reparacion.Cliente.Telefono1 = telefono;
                updates.Add($"teléfono: '{old}' → '{telefono}'");
            }

            if (!string.IsNullOrWhiteSpace(telefono2))
            {
                var old = reparacion.Cliente.Telefono2;
                reparacion.Cliente.Telefono2 = telefono2;
                updates.Add($"teléfono 2: '{old}' → '{telefono2}'");
            }

            if (!string.IsNullOrWhiteSpace(email))
            {
                var old = reparacion.Cliente.Mail;
                reparacion.Cliente.Mail = email;
                updates.Add($"email: '{old}' → '{email}'");
            }

            if (!string.IsNullOrWhiteSpace(direccion))
            {
                var old = reparacion.Cliente.Direccion;
                reparacion.Cliente.Direccion = direccion;
                updates.Add($"dirección: '{old}' → '{direccion}'");
            }

            if (!string.IsNullOrWhiteSpace(localidad))
            {
                var old = reparacion.Cliente.Localidad;
                reparacion.Cliente.Localidad = localidad;
                updates.Add($"localidad: '{old}' → '{localidad}'");
            }

            if (updates.Count == 0)
            {
                return ToolResponseHelper.Error("No se proporcionaron campos para actualizar", new { orderNumber });
            }

            reparacion.ModificadoEn = DateTime.Now;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated {Count} customer field(s) for order #{OrderNumber}", updates.Count, orderNumber);

            var updatedOrder = await _orderService.GetOrderDetailsAsync(orderNumber);

            return ToolResponseHelper.Success(new
            {
                orderNumber,
                updatedFields = updates,
                order = updatedOrder
            }, $"✅ Datos del cliente actualizados:\n• {string.Join("\n• ", updates)}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating customer info for order #{OrderNumber}", orderNumber);
            return ToolResponseHelper.Error($"Error al actualizar datos del cliente: {ex.Message}", new { orderNumber });
        }
    }

    /// <summary>
    /// Update device/equipment information for an order.
    /// </summary>
    [McpServerTool(Name = "UpdateDeviceInfo")]
    [Description("Update device/equipment information for an order. Use when the user wants to update device-related fields.")]
    public async Task<string> UpdateDeviceInfoAsync(
        [Description("Order number")] int orderNumber,
        [Description("Device model (optional)")] string? modelo = null,
        [Description("Serial number (optional)")] string? serie = null,
        [Description("Location/shelf (optional)")] string? ubicacion = null,
        [Description("Accessories (optional)")] string? accesorios = null)
    {
        try
        {
            _logger.LogInformation("Updating device info for order #{OrderNumber}", orderNumber);

            var reparacion = await _context.Reparacions
                .Include(r => r.ReparacionDetalle)
                .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

            if (reparacion == null)
            {
                return ToolResponseHelper.NotFound("order", new { orderNumber });
            }

            if (reparacion.ReparacionDetalle == null)
            {
                return ToolResponseHelper.Error("La orden no tiene detalles de dispositivo", new { orderNumber });
            }

            var updates = new List<string>();
            var detalle = reparacion.ReparacionDetalle;

            if (!string.IsNullOrWhiteSpace(modelo))
            {
                var old = detalle.Modelo;
                detalle.Modelo = modelo;
                updates.Add($"modelo: '{old}' → '{modelo}'");
            }

            if (!string.IsNullOrWhiteSpace(serie))
            {
                var old = detalle.Serie;
                detalle.Serie = serie;
                updates.Add($"serie: '{old}' → '{serie}'");
            }

            if (!string.IsNullOrWhiteSpace(ubicacion))
            {
                var old = detalle.Unicacion;
                detalle.Unicacion = ubicacion;
                updates.Add($"ubicación: '{old}' → '{ubicacion}'");
            }

            if (!string.IsNullOrWhiteSpace(accesorios))
            {
                var old = detalle.Accesorios;
                detalle.Accesorios = accesorios;
                updates.Add($"accesorios: '{old}' → '{accesorios}'");
            }

            if (updates.Count == 0)
            {
                return ToolResponseHelper.Error("No se proporcionaron campos para actualizar", new { orderNumber });
            }

            detalle.ModificadoEn = DateTime.Now;
            reparacion.ModificadoEn = DateTime.Now;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated {Count} device field(s) for order #{OrderNumber}", updates.Count, orderNumber);

            var updatedOrder = await _orderService.GetOrderDetailsAsync(orderNumber);

            return ToolResponseHelper.Success(new
            {
                orderNumber,
                updatedFields = updates,
                order = updatedOrder
            }, $"✅ Datos del dispositivo actualizados:\n• {string.Join("\n• ", updates)}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device info for order #{OrderNumber}", orderNumber);
            return ToolResponseHelper.Error($"Error al actualizar datos del dispositivo: {ex.Message}", new { orderNumber });
        }
    }
}
