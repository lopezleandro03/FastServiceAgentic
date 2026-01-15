using System.Text.Json;

namespace FastService.McpServer.Tools;

/// <summary>
/// Helper class for creating consistent JSON responses from MCP tools.
/// </summary>
public static class ToolResponseHelper
{
    private static readonly JsonSerializerOptions DefaultOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    /// <summary>
    /// Creates a successful response with data.
    /// </summary>
    public static string Success<T>(T data, string? message = null)
    {
        return JsonSerializer.Serialize(new
        {
            success = true,
            message = message ?? "Operation completed successfully",
            data
        }, DefaultOptions);
    }

    /// <summary>
    /// Creates a successful response with data and count.
    /// </summary>
    public static string SuccessWithCount<T>(T data, int count, string? message = null)
    {
        return JsonSerializer.Serialize(new
        {
            success = true,
            message = message ?? $"Found {count} result(s)",
            count,
            data
        }, DefaultOptions);
    }

    /// <summary>
    /// Creates an error response.
    /// </summary>
    public static string Error(string message, object? context = null)
    {
        var response = new Dictionary<string, object>
        {
            ["success"] = false,
            ["message"] = message
        };

        if (context != null)
        {
            response["context"] = context;
        }

        return JsonSerializer.Serialize(response, DefaultOptions);
    }

    /// <summary>
    /// Creates a not found response.
    /// </summary>
    public static string NotFound(string entityType, object searchCriteria)
    {
        return JsonSerializer.Serialize(new
        {
            success = false,
            message = $"No {entityType} found matching the criteria",
            criteria = searchCriteria,
            count = 0
        }, DefaultOptions);
    }

    /// <summary>
    /// Serializes an object to JSON with default options.
    /// </summary>
    public static string ToJson<T>(T obj)
    {
        return JsonSerializer.Serialize(obj, DefaultOptions);
    }

    /// <summary>
    /// Creates a JSON response from any object (for navigation actions, etc.)
    /// </summary>
    public static string SuccessJson<T>(T data)
    {
        return JsonSerializer.Serialize(data, DefaultOptions);
    }
}
