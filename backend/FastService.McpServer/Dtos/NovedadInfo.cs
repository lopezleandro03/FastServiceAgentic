namespace FastService.McpServer.Dtos
{
    /// <summary>
    /// Novedad (order history event) information from Novedad + TipoNovedad tables
    /// </summary>
    public class NovedadInfo
    {
        /// <summary>Novedad ID</summary>
        public int Id { get; set; }
        
        /// <summary>Event timestamp</summary>
        public DateTime Fecha { get; set; }
        
        /// <summary>Event type name (from TipoNovedad)</summary>
        public string Tipo { get; set; } = string.Empty;
        
        /// <summary>Amount if applicable</summary>
        public decimal? Monto { get; set; }
        
        /// <summary>Description/notes</summary>
        public string? Observacion { get; set; }
        
        /// <summary>User who created the event</summary>
        public int UsuarioId { get; set; }
    }
}
