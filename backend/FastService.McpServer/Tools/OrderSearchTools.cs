using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;
using FastService.McpServer.Services;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;

namespace FastService.McpServer.Tools;

/// <summary>
/// MCP Tools for order search operations.
/// These tools are exposed via the MCP protocol for external clients
/// and called by the AI agent to query the database.
/// </summary>
[McpServerToolType]
public class OrderSearchTools
{
    private readonly OrderService _orderService;
    private readonly ILogger<OrderSearchTools> _logger;

    public OrderSearchTools(OrderService orderService, ILogger<OrderSearchTools> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Search for a repair order by its order number.
    /// </summary>
    [McpServerTool(Name = "SearchOrderByNumber")]
    [Description("Search for a repair order by its order number. Returns complete details including customer, device, repair status, and dates.")]
    public async Task<string> SearchOrdersByNumberAsync(
        [Description("The repair order number to search for")] int orderNumber)
    {
        try
        {
            _logger.LogInformation("Searching for order by number: {OrderNumber}", orderNumber);

            var orderDetails = await _orderService.GetOrderDetailsAsync(orderNumber);

            if (orderDetails == null)
            {
                return ToolResponseHelper.NotFound("order", new { orderNumber });
            }

            return ToolResponseHelper.Success(orderDetails, "Order found successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching order by number: {OrderNumber}", orderNumber);
            return ToolResponseHelper.Error($"Error searching for order: {ex.Message}", new { orderNumber });
        }
    }

    /// <summary>
    /// Search for repair orders by customer name.
    /// Performs fuzzy matching on customer first and last names.
    /// </summary>
    [McpServerTool(Name = "SearchOrdersByCustomer")]
    [Description("Search for repair orders by customer name. Supports partial name matching (fuzzy search).")]
    public async Task<string> SearchOrdersByCustomerAsync(
        [Description("The customer name to search for (partial matches allowed)")] string customerName,
        [Description("Maximum number of results to return")] int maxResults = 10)
    {
        try
        {
            _logger.LogInformation("Searching orders for customer: {CustomerName}", customerName);

            var criteria = new OrderSearchCriteria
            {
                CustomerName = customerName,
                MaxResults = maxResults
            };

            var orders = await _orderService.SearchOrdersAsync(criteria);

            if (orders.Count == 0)
            {
                return ToolResponseHelper.NotFound("orders", new { customerName });
            }

            return ToolResponseHelper.SuccessWithCount(orders, orders.Count, 
                $"Found {orders.Count} order(s) for customer '{customerName}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by customer: {CustomerName}", customerName);
            return ToolResponseHelper.Error($"Error searching orders: {ex.Message}", new { customerName });
        }
    }

    /// <summary>
    /// Search for repair orders by status.
    /// </summary>
    [McpServerTool(Name = "SearchOrdersByStatus")]
    [Description("Search for repair orders by repair status (e.g., 'Pendiente', 'En reparación', 'Finalizado').")]
    public async Task<string> SearchOrdersByStatusAsync(
        [Description("The repair status to filter by")] string status,
        [Description("Maximum number of results to return")] int maxResults = 20)
    {
        try
        {
            _logger.LogInformation("Searching orders by status: {Status}", status);

            var criteria = new OrderSearchCriteria
            {
                Status = status,
                MaxResults = maxResults
            };

            var orders = await _orderService.SearchOrdersAsync(criteria);

            if (orders.Count == 0)
            {
                return ToolResponseHelper.NotFound("orders", new { status });
            }

            return ToolResponseHelper.SuccessWithCount(orders, orders.Count,
                $"Found {orders.Count} order(s) with status '{status}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by status: {Status}", status);
            return ToolResponseHelper.Error($"Error searching orders: {ex.Message}", new { status });
        }
    }

    /// <summary>
    /// Search for repair orders by customer DNI (national ID).
    /// </summary>
    [McpServerTool(Name = "SearchOrdersByDNI")]
    [Description("Search for repair orders by customer DNI (national ID number).")]
    public async Task<string> SearchOrdersByDNIAsync(
        [Description("The customer DNI to search for")] string dni)
    {
        try
        {
            _logger.LogInformation("Searching orders by DNI: {DNI}", dni);

            var criteria = new OrderSearchCriteria
            {
                DNI = dni,
                MaxResults = 50
            };

            var orders = await _orderService.SearchOrdersAsync(criteria);

            if (orders.Count == 0)
            {
                return ToolResponseHelper.NotFound("orders", new { dni });
            }

            return ToolResponseHelper.SuccessWithCount(orders, orders.Count,
                $"Found {orders.Count} order(s) for DNI '{dni}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by DNI: {DNI}", dni);
            return ToolResponseHelper.Error($"Error searching orders: {ex.Message}", new { dni });
        }
    }

    /// <summary>
    /// Search for repair orders by customer address.
    /// Performs fuzzy matching on the customer's address.
    /// </summary>
    [McpServerTool(Name = "SearchOrdersByAddress")]
    [Description("Search for repair orders by customer address. Supports partial address matching (street name, neighborhood, city).")]
    public async Task<string> SearchOrdersByAddressAsync(
        [Description("The address to search for (street name, neighborhood, or city)")] string address,
        [Description("Maximum number of results to return")] int maxResults = 15)
    {
        try
        {
            _logger.LogInformation("Searching orders by address: {Address}", address);

            var criteria = new OrderSearchCriteria
            {
                Address = address,
                MaxResults = maxResults
            };

            var orders = await _orderService.SearchOrdersAsync(criteria);

            if (orders.Count == 0)
            {
                return ToolResponseHelper.NotFound("orders", new { address });
            }

            return ToolResponseHelper.SuccessWithCount(orders, orders.Count,
                $"Found {orders.Count} order(s) for address containing '{address}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by address: {Address}", address);
            return ToolResponseHelper.Error($"Error searching orders: {ex.Message}", new { address });
        }
    }

    /// <summary>
    /// Get all available repair statuses.
    /// </summary>
    [McpServerTool(Name = "GetAllStatuses")]
    [Description("Get all available repair statuses in the system.")]
    public async Task<string> GetAllStatusesAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all repair statuses");

            var statuses = await _orderService.GetAllStatusesAsync();

            return ToolResponseHelper.SuccessWithCount(statuses, statuses.Count,
                $"Retrieved {statuses.Count} status(es)");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statuses");
            return ToolResponseHelper.Error($"Error retrieving statuses: {ex.Message}");
        }
    }

    /// <summary>
    /// Search orders by brand and device type.
    /// </summary>
    [McpServerTool(Name = "SearchOrdersByDevice")]
    [Description("Search for repair orders by device brand and/or device type.")]
    public async Task<string> SearchOrdersByDeviceAsync(
        [Description("The device brand (e.g., 'Samsung', 'iPhone')")] string? brand = null,
        [Description("The device type (e.g., 'Celular', 'Tablet', 'Notebook')")] string? deviceType = null,
        [Description("Maximum number of results to return")] int maxResults = 15)
    {
        try
        {
            _logger.LogInformation("Searching orders by brand: {Brand}, deviceType: {DeviceType}", brand, deviceType);

            var criteria = new OrderSearchCriteria
            {
                Brand = brand,
                DeviceType = deviceType,
                MaxResults = maxResults
            };

            var orders = await _orderService.SearchOrdersAsync(criteria);

            string searchDescription = (brand, deviceType) switch
            {
                (not null, not null) => $"brand '{brand}' and device type '{deviceType}'",
                (not null, null) => $"brand '{brand}'",
                (null, not null) => $"device type '{deviceType}'",
                _ => "all devices"
            };

            if (orders.Count == 0)
            {
                return ToolResponseHelper.NotFound("orders", new { brand, deviceType });
            }

            return ToolResponseHelper.SuccessWithCount(orders, orders.Count,
                $"Found {orders.Count} order(s) for {searchDescription}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by device - Brand: {Brand}, Type: {DeviceType}", brand, deviceType);
            return ToolResponseHelper.Error($"Error searching orders: {ex.Message}", new { brand, deviceType });
        }
    }

    /// <summary>
    /// Search orders by model name and optionally filter by status.
    /// Performs fuzzy matching on device model.
    /// </summary>
    [McpServerTool(Name = "SearchOrdersByModel")]
    [Description("Search for repair orders by device model name (fuzzy match) and optionally filter by repair status. Common use: find orders for a specific device model like 'iPhone 14', 'Galaxy S23', 'MacBook Pro'.")]
    public async Task<string> SearchOrdersByModelAsync(
        [Description("The device model to search for (partial matches allowed, e.g., 'iPhone 14', 'Galaxy', 'MacBook')")] string model,
        [Description("Optional: Filter by repair status (e.g., 'Pendiente', 'En reparación', 'Finalizado')")] string? status = null,
        [Description("Maximum number of results to return")] int maxResults = 20)
    {
        try
        {
            _logger.LogInformation("Searching orders by model: {Model}, status: {Status}", model, status);

            var criteria = new OrderSearchCriteria
            {
                Model = model,
                Status = status,
                MaxResults = maxResults
            };

            var orders = await _orderService.SearchOrdersAsync(criteria);

            string searchDescription = status != null 
                ? $"model '{model}' with status '{status}'"
                : $"model '{model}'";

            if (orders.Count == 0)
            {
                return ToolResponseHelper.NotFound("orders", new { model, status });
            }

            return ToolResponseHelper.SuccessWithCount(orders, orders.Count,
                $"Found {orders.Count} order(s) for {searchDescription}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by model: {Model}, status: {Status}", model, status);
            return ToolResponseHelper.Error($"Error searching orders: {ex.Message}", new { model, status });
        }
    }
}
