namespace FastService.McpServer.Dtos
{
    /// <summary>
    /// Structured address information from Direccion table
    /// </summary>
    public class AddressInfo
    {
        /// <summary>Complete address string (legacy format)</summary>
        public string? FullAddress { get; set; }
        
        /// <summary>Street name</summary>
        public string? Calle { get; set; }
        
        /// <summary>Street number</summary>
        public string? Altura { get; set; }
        
        /// <summary>Cross street 1 (Entre calle)</summary>
        public string? EntreCalle1 { get; set; }
        
        /// <summary>Cross street 2 (Entre calle)</summary>
        public string? EntreCalle2 { get; set; }
        
        /// <summary>City name</summary>
        public string? Ciudad { get; set; }
        
        /// <summary>Postal code</summary>
        public string? CodigoPostal { get; set; }
    }
}
