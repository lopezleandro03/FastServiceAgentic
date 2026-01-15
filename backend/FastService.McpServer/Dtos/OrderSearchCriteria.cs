namespace FastService.McpServer.Dtos
{
    public class OrderSearchCriteria
    {
        public int? OrderNumber { get; set; }
        public string? CustomerName { get; set; }
        public string? DNI { get; set; }
        public string? Address { get; set; }
        public string? TechnicianName { get; set; }
        public string? Status { get; set; }
        public List<string>? Statuses { get; set; }
        public string? Brand { get; set; }
        public string? DeviceType { get; set; }
        public string? SerialNumber { get; set; }
        public string? Model { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int MaxResults { get; set; } = 500;
    }
}
