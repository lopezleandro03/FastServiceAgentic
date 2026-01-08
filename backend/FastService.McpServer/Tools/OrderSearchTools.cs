using FastService.McpServer.Data.Entities;
using FastService.McpServer.Dtos;
using FastService.McpServer.Services;
using System.Text.Json;

namespace FastService.McpServer.Tools;

/// <summary>
/// MCP Tools for order search operations.
/// These tools are called by the AI agent to query the database.
/// </summary>
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
    /// <param name="orderNumber">The repair order number to search for</param>
    /// <returns>Complete order details including customer, device, and repair information</returns>
    public async Task<string> SearchOrdersByNumberAsync(int orderNumber)
    {
        try
        {
            _logger.LogInformation("Searching for order by number: {OrderNumber}", orderNumber);

            var orderDetails = await _orderService.GetOrderDetailsAsync(orderNumber);

            if (orderDetails == null)
            {
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    message = $"No order found with number {orderNumber}",
                    orderNumber
                });
            }

            return JsonSerializer.Serialize(new
            {
                success = true,
                message = "Order found successfully",
                data = orderDetails
            }, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching order by number: {OrderNumber}", orderNumber);
            return JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Error searching for order: {ex.Message}",
                orderNumber
            });
        }
    }

    /// <summary>
    /// Search for repair orders by customer name.
    /// Performs fuzzy matching on customer first and last names.
    /// </summary>
    /// <param name="customerName">The customer name to search for (partial matches allowed)</param>
    /// <param name="maxResults">Maximum number of results to return (default: 10)</param>
    /// <returns>List of orders matching the customer name</returns>
    public async Task<string> SearchOrdersByCustomerAsync(string customerName, int maxResults = 10)
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
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    message = $"No orders found for customer '{customerName}'",
                    customerName,
                    count = 0
                });
            }

            return JsonSerializer.Serialize(new
            {
                success = true,
                message = $"Found {orders.Count} order(s) for customer '{customerName}'",
                count = orders.Count,
                data = orders
            }, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by customer: {CustomerName}", customerName);
            return JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Error searching orders: {ex.Message}",
                customerName
            });
        }
    }

    /// <summary>
    /// Search for repair orders by status.
    /// </summary>
    /// <param name="status">The repair status to filter by (e.g., 'Pendiente', 'En reparación', 'Finalizado')</param>
    /// <param name="maxResults">Maximum number of results to return (default: 20)</param>
    /// <returns>List of orders with the specified status</returns>
    public async Task<string> SearchOrdersByStatusAsync(string status, int maxResults = 20)
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
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    message = $"No orders found with status '{status}'",
                    status,
                    count = 0
                });
            }

            return JsonSerializer.Serialize(new
            {
                success = true,
                message = $"Found {orders.Count} order(s) with status '{status}'",
                count = orders.Count,
                data = orders
            }, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by status: {Status}", status);
            return JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Error searching orders: {ex.Message}",
                status
            });
        }
    }

    /// <summary>
    /// Search for repair orders by customer DNI (national ID).
    /// </summary>
    /// <param name="dni">The customer DNI to search for</param>
    /// <returns>List of orders for the customer with the specified DNI</returns>
    public async Task<string> SearchOrdersByDNIAsync(string dni)
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
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    message = $"No orders found for DNI '{dni}'",
                    dni,
                    count = 0
                });
            }

            return JsonSerializer.Serialize(new
            {
                success = true,
                message = $"Found {orders.Count} order(s) for DNI '{dni}'",
                count = orders.Count,
                data = orders
            }, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by DNI: {DNI}", dni);
            return JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Error searching orders: {ex.Message}",
                dni
            });
        }
    }

    /// <summary>
    /// Get all available repair statuses.
    /// </summary>
    /// <returns>List of all active repair statuses</returns>
    public async Task<string> GetAllStatusesAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all repair statuses");

            var statuses = await _orderService.GetAllStatusesAsync();

            return JsonSerializer.Serialize(new
            {
                success = true,
                message = $"Retrieved {statuses.Count} status(es)",
                count = statuses.Count,
                data = statuses
            }, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statuses");
            return JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Error retrieving statuses: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Search orders by brand and device type.
    /// </summary>
    /// <param name="brand">The device brand (e.g., 'Samsung', 'iPhone')</param>
    /// <param name="deviceType">The device type (e.g., 'Celular', 'Tablet', 'Notebook')</param>
    /// <param name="maxResults">Maximum number of results to return (default: 15)</param>
    /// <returns>List of orders for the specified brand and device type</returns>
    public async Task<string> SearchOrdersByDeviceAsync(string? brand = null, string? deviceType = null, int maxResults = 15)
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
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    message = $"No orders found for {searchDescription}",
                    brand,
                    deviceType,
                    count = 0
                });
            }

            return JsonSerializer.Serialize(new
            {
                success = true,
                message = $"Found {orders.Count} order(s) for {searchDescription}",
                count = orders.Count,
                data = orders
            }, new JsonSerializerOptions { WriteIndented = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching orders by device - Brand: {Brand}, Type: {DeviceType}", brand, deviceType);
            return JsonSerializer.Serialize(new
            {
                success = false,
                message = $"Error searching orders: {ex.Message}",
                brand,
                deviceType
            });
        }
    }
}
