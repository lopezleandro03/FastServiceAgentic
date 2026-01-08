namespace FastService.McpServer.Dtos
{
    public class OrderSummary
    {
        public int OrderNumber { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string DeviceInfo { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public decimal? EstimatedPrice { get; set; }
    }
}
