namespace FastService.McpServer.Dtos
{
    public class OrderDetails
    {
        public int OrderNumber { get; set; }
        public CustomerInfo Customer { get; set; } = new();
        public DeviceInfo Device { get; set; } = new();
        public RepairInfo Repair { get; set; } = new();
        public UserInfo Technician { get; set; } = new();
        public List<RepairDetailInfo> Details { get; set; } = new();
    }

    public class CustomerInfo
    {
        public int CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? DNI { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }

    public class DeviceInfo
    {
        public string Brand { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public string? SerialNumber { get; set; }
    }

    public class RepairInfo
    {
        public string Status { get; set; } = string.Empty;
        public string? Observations { get; set; }
        public string? EntryDate { get; set; }
        public string? ExitDate { get; set; }
        public string? EstimatedDeliveryDate { get; set; }
        public decimal? EstimatedPrice { get; set; }
        public decimal? FinalPrice { get; set; }
        public bool UnderWarranty { get; set; }
    }

    public class UserInfo
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }

    public class RepairDetailInfo
    {
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Total { get; set; }
    }
}
