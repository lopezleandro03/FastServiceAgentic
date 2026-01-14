namespace FastService.McpServer.Dtos;

/// <summary>
/// DTO for menu item permission
/// </summary>
public class MenuItemDto
{
    public int ItemMenuId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Controller { get; set; }
    public string? Action { get; set; }
    public string? Icon { get; set; }
    public int Order { get; set; }
}

/// <summary>
/// DTO for user role
/// </summary>
public class UserRoleDto
{
    public int RoleId { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Response containing user permissions including roles and allowed menu items
/// </summary>
public class UserPermissionsResponse
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<UserRoleDto> Roles { get; set; } = new();
    public List<MenuItemDto> AllowedMenuItems { get; set; } = new();
    
    /// <summary>
    /// Convenience properties for common module access
    /// </summary>
    public bool CanAccessAccounting { get; set; }
    public bool CanAccessOrders { get; set; }
    public bool CanAccessKanban { get; set; }
    
    /// <summary>
    /// Role-based action permissions
    /// IsManager: Gerente (1) - sees all actions with collapsible groups
    /// IsAdmin: FastServiceAdmin (3), Gerente (1), ElectroShopAdmin (2)
    /// IsTecnico: Tecnico (4)
    /// </summary>
    public bool IsManager { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsTecnico { get; set; }
}
