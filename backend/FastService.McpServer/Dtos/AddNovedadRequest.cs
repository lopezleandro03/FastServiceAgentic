namespace FastService.McpServer.Dtos;

/// <summary>
/// Request DTO for adding a new novedad (note/movement) to an order
/// </summary>
public class AddNovedadRequest
{
    /// <summary>
    /// The order number to add the novedad to
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// The type of novedad (see NovedadTipo enum values)
    /// Common values: 17 = NOTA, 26 = SENA, 24 = REINGRESO, 5 = RETIRA
    /// </summary>
    public int TipoNovedadId { get; set; }

    /// <summary>
    /// The observation/note text
    /// </summary>
    public string? Observacion { get; set; }

    /// <summary>
    /// Optional amount (for SENA, PRESUPUESTO, etc.)
    /// </summary>
    public decimal? Monto { get; set; }

    /// <summary>
    /// The user ID performing the action (required)
    /// </summary>
    public required int UserId { get; set; }
}

/// <summary>
/// Common novedad type IDs matching the baseline application
/// </summary>
public static class NovedadTipoIds
{
    public const int INGRESO = 1;
    public const int PRESUPUESTADO = 2;
    public const int ACEPTA = 3;
    public const int REPARADO = 4;
    public const int RETIRA = 5;
    public const int RECHAZA = 6;
    public const int ENTREGA = 12;
    public const int ESPERAREPUESTO = 16;
    public const int NOTA = 17;
    public const int RECHAZAPRESUP = 23;
    public const int REINGRESO = 24;
    public const int SENA = 26;
    public const int PRESUPINFOR = 31;
    public const int ACONTROLAR = 33;
    public const int VERIFICAR = 39;
    public const int REPDOMICILIO = 40;
    public const int LLAMADO = 43;
    public const int ARMADO = 44;      // New: Technician assembled/packed the equipment
    public const int ARCHIVADO = 45;   // New: Admin archived equipment (moved to stock)
}
