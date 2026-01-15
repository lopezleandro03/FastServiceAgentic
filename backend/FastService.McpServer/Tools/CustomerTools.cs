using FastService.McpServer.Services;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace FastService.McpServer.Tools;

/// <summary>
/// MCP Tools for customer-related operations.
/// These tools enable external clients to query customer information.
/// </summary>
[McpServerToolType]
public class CustomerTools
{
    private readonly ClientService _clientService;
    private readonly OrderService _orderService;
    private readonly ILogger<CustomerTools> _logger;

    public CustomerTools(
        ClientService clientService, 
        OrderService orderService,
        ILogger<CustomerTools> logger)
    {
        _clientService = clientService;
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Search for customers by name, address, or phone number.
    /// Returns matching customers with their order counts.
    /// </summary>
    [McpServerTool(Name = "SearchCustomerByName")]
    [Description("Search for customers by name, address, or phone. Returns matching customers with their order counts.")]
    public async Task<string> SearchCustomerByNameAsync(
        [Description("The search term (name, address, phone or DNI)")] string name,
        [Description("Maximum number of results to return")] int maxResults = 10)
    {
        try
        {
            _logger.LogInformation("Searching customers by name: {SearchTerm}", name);

            var customers = await _clientService.SearchClientsFuzzyAsync(name.Trim(), maxResults);

            if (customers.Count == 0)
            {
                return ToolResponseHelper.NotFound("customers", new { searchTerm = name });
            }

            var results = customers.Select(c => new
            {
                customerId = c.ClienteId,
                name = $"{c.Nombre} {c.Apellido}".Trim(),
                dni = c.Dni,
                phone = c.Telefono ?? c.Celular,
                email = c.Email,
                orderCount = c.OrderCount
            }).ToList();

            return ToolResponseHelper.SuccessWithCount(results, results.Count,
                $"Encontré {results.Count} cliente(s) que coinciden con '{name}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching customers: {SearchTerm}", name);
            return ToolResponseHelper.Error($"Error al buscar clientes: {ex.Message}", new { searchTerm = name });
        }
    }

    /// <summary>
    /// Get a customer by their DNI (national ID).
    /// </summary>
    [McpServerTool(Name = "GetCustomerByDNI")]
    [Description("Get customer details by their DNI (national ID number).")]
    public async Task<string> GetCustomerByDNIAsync(
        [Description("The customer DNI to search for")] string dni)
    {
        try
        {
            _logger.LogInformation("Getting customer by DNI: {DNI}", dni);

            var customer = await _clientService.GetClientByDniAsync(dni);

            if (customer == null)
            {
                return ToolResponseHelper.NotFound("customer", new { dni });
            }

            return ToolResponseHelper.Success(new
            {
                customer.ClienteId,
                customer.Dni,
                customer.Nombre,
                customer.Apellido,
                FullName = $"{customer.Nombre} {customer.Apellido}",
                customer.Email,
                customer.Telefono,
                customer.Celular,
                customer.Direccion,
                customer.Localidad,
                customer.AddressDetails
            }, "Customer found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer by DNI: {DNI}", dni);
            return ToolResponseHelper.Error($"Error getting customer: {ex.Message}", new { dni });
        }
    }

    /// <summary>
    /// Get full customer details by ID.
    /// </summary>
    [McpServerTool(Name = "GetCustomerById")]
    [Description("Get complete customer details including order history by customer ID.")]
    public async Task<string> GetCustomerByIdAsync(
        [Description("The customer ID")] int customerId)
    {
        try
        {
            _logger.LogInformation("Getting customer by ID: {CustomerId}", customerId);

            var customer = await _clientService.GetClientDetailsAsync(customerId);

            if (customer == null)
            {
                return ToolResponseHelper.NotFound("customer", new { customerId });
            }

            return ToolResponseHelper.Success(customer, "Customer details retrieved");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer by ID: {CustomerId}", customerId);
            return ToolResponseHelper.Error($"Error getting customer: {ex.Message}", new { customerId });
        }
    }

    /// <summary>
    /// Get order history for a customer.
    /// </summary>
    [McpServerTool(Name = "GetCustomerOrderHistory")]
    [Description("Get the repair order history for a specific customer.")]
    public async Task<string> GetCustomerOrderHistoryAsync(
        [Description("The customer ID")] int customerId,
        [Description("Maximum number of orders to return")] int maxResults = 20)
    {
        try
        {
            _logger.LogInformation("Getting order history for customer: {CustomerId}", customerId);

            var customer = await _clientService.GetClientDetailsAsync(customerId);

            if (customer == null)
            {
                return ToolResponseHelper.NotFound("customer", new { customerId });
            }

            var orders = customer.Orders?.Take(maxResults).ToList() ?? new List<Dtos.ClientOrderSummaryDto>();

            return ToolResponseHelper.SuccessWithCount(new
            {
                CustomerId = customer.ClienteId,
                CustomerName = $"{customer.Nombre} {customer.Apellido}",
                Orders = orders
            }, orders.Count, $"Found {orders.Count} order(s) for customer '{customer.Nombre} {customer.Apellido}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting order history for customer: {CustomerId}", customerId);
            return ToolResponseHelper.Error($"Error getting order history: {ex.Message}", new { customerId });
        }
    }

    /// <summary>
    /// Get statistics for a customer.
    /// </summary>
    [McpServerTool(Name = "GetCustomerStats")]
    [Description("Get statistics for a customer including total orders, spending, and repair history.")]
    public async Task<string> GetCustomerStatsAsync(
        [Description("The customer ID")] int customerId)
    {
        try
        {
            _logger.LogInformation("Getting stats for customer: {CustomerId}", customerId);

            var customer = await _clientService.GetClientDetailsAsync(customerId);

            if (customer == null)
            {
                return ToolResponseHelper.NotFound("customer", new { customerId });
            }

            return ToolResponseHelper.Success(new
            {
                CustomerId = customer.ClienteId,
                CustomerName = $"{customer.Nombre} {customer.Apellido}",
                Stats = customer.Stats
            }, $"Statistics for customer '{customer.Nombre} {customer.Apellido}'");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stats for customer: {CustomerId}", customerId);
            return ToolResponseHelper.Error($"Error getting customer stats: {ex.Message}", new { customerId });
        }
    }
}
