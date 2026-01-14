namespace FastService.McpServer.Dtos;

// ============= PRESUPUESTO (Create Budget) =============

/// <summary>
/// Request for creating a budget/quote (by technician)
/// NovedadTipo: PRESUPUESTADO = 2
/// Status: → "PRESUPUESTADO" or "PRESUP. EN DOMICILIO" (if domicile)
/// </summary>
public class PresupuestoRequest
{
    /// <summary>
    /// Budget amount (required)
    /// </summary>
    public decimal Monto { get; set; }
    
    /// <summary>
    /// Optional observation about the budget
    /// </summary>
    public string? Observacion { get; set; }
}

public class PresupuestoResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public int NovedadId { get; set; }
}

// ============= REPARADO (Mark as Repaired) =============

/// <summary>
/// Request for marking an order as repaired (by technician)
/// NovedadTipo: REPARADO = 4
/// Status: → "REPARADO"
/// </summary>
public class ReparadoRequest
{
    /// <summary>
    /// Description of the repair work done (optional but recommended)
    /// This is saved to ReparacionDetalle.ReparacionDesc
    /// </summary>
    public string? Observacion { get; set; }
}

public class ReparadoResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public int NovedadId { get; set; }
}

// ============= RECHAZAR (Technician Can't Repair) =============

/// <summary>
/// Request for technician rejection (can't repair - no parts, irreparable, etc.)
/// NovedadTipo: RECHAZA = 6
/// Status: → "RECHAZADO"
/// Different from client rejection (RECHAZO PRESUP.)
/// </summary>
public class RechazarRequest
{
    /// <summary>
    /// Reason for rejection (required)
    /// E.g., "Sin repuestos", "Daño irreparable", "No se justifica reparación"
    /// </summary>
    public string Observacion { get; set; } = string.Empty;
}

public class RechazarResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public int NovedadId { get; set; }
}

// ============= ESPERA REPUESTO (Waiting for Parts) =============

/// <summary>
/// Request for marking an order as waiting for parts
/// NovedadTipo: ESPERAREPUESTO = 16
/// Status: → "ESP. REPUESTO"
/// </summary>
public class EsperaRepuestoRequest
{
    /// <summary>
    /// Description of the required part (required)
    /// </summary>
    public string Observacion { get; set; } = string.Empty;
}

public class EsperaRepuestoResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public int NovedadId { get; set; }
}

// ============= REP. DOMICILIO (Home Repair) =============

/// <summary>
/// Request for home repair completion
/// NovedadTipo: REPDOMICILIO = 40
/// Status: → "RETIRADO" (completed)
/// Generates accounting entry if monto > 0
/// </summary>
public class RepDomicilioRequest
{
    /// <summary>
    /// Amount charged for the home repair
    /// </summary>
    public decimal Monto { get; set; }
    
    /// <summary>
    /// Payment method ID (required if monto > 0)
    /// </summary>
    public int MetodoPagoId { get; set; }
    
    /// <summary>
    /// Optional observation about the home repair
    /// </summary>
    public string? Observacion { get; set; }
    
    /// <summary>
    /// Whether invoice was generated
    /// </summary>
    public bool Facturado { get; set; }
    
    /// <summary>
    /// Invoice type ID (if invoiced)
    /// </summary>
    public int? TipoFacturaId { get; set; }
    
    /// <summary>
    /// Invoice number (if invoiced)
    /// </summary>
    public string? NroFactura { get; set; }
}

public class RepDomicilioResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderNumber { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public int NovedadId { get; set; }
    public int? VentaId { get; set; }
}
