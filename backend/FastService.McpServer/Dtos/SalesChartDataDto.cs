namespace FastService.McpServer.Dtos;

/// <summary>
/// Dataset for chart visualization
/// </summary>
public class ChartDatasetDto
{
    public string Label { get; set; } = string.Empty;
    public List<decimal> Data { get; set; } = new();
}

/// <summary>
/// Sales chart data with labels and datasets
/// </summary>
public class SalesChartDataDto
{
    public string Period { get; set; } = string.Empty;
    public List<string> Labels { get; set; } = new();
    public List<ChartDatasetDto> Datasets { get; set; } = new();
}
