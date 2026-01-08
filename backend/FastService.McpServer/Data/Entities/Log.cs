using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class Log
{
    public int Id { get; set; }

    public string Application { get; set; } = null!;

    public DateTime Logged { get; set; }

    public string Level { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string? UserName { get; set; }

    public string? ServerName { get; set; }

    public string? Port { get; set; }

    public string? Url { get; set; }

    public bool? Https { get; set; }

    public string? ServerAddress { get; set; }

    public string? RemoteAddress { get; set; }

    public string? Logger { get; set; }

    public string? Callsite { get; set; }

    public string? Exception { get; set; }
}
