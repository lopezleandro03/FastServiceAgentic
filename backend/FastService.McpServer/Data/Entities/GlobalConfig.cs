using System;
using System.Collections.Generic;

namespace FastService.McpServer.Data.Entities;

public partial class GlobalConfig
{
    public int GlobalConfigId { get; set; }

    public string Key { get; set; } = null!;

    public string Value { get; set; } = null!;
}
