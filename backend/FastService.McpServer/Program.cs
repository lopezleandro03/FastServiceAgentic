using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Services;
using FastService.McpServer.Tools;
using FastService.McpServer.Dtos;
using ModelContextProtocol.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Configure DbContext
builder.Services.AddDbContext<FastServiceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FastServiceDb")));

// Register application services
builder.Services.AddSingleton<OrderCacheService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<OrderCacheService>());
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<OrderSearchTools>();
builder.Services.AddScoped<CustomerTools>();
builder.Services.AddScoped<AccountingTools>();
builder.Services.AddScoped<OrderUpdateTools>();
builder.Services.AddScoped<AgentService>();
builder.Services.AddScoped<AccountingService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<WhatsAppService>();

// Configure CORS for frontend
// Supports: AllowedOrigins config array, ALLOWED_ORIGINS env var (comma-separated), or defaults to localhost
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',', StringSplitOptions.RemoveEmptyEntries)
    ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// MCP Server configuration - expose tools via HTTP/SSE transport
builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithToolsFromAssembly();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Map MCP endpoint for external clients (Claude Desktop, VS Code, etc.)
app.MapMcp("/mcp");

// Map controllers (AccountingController, etc.)
app.MapControllers();

// Basic health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Login endpoint - authenticates against Usuario table
app.MapPost("/api/auth/login", async (LoginRequest request, FastServiceDbContext db) =>
{
    try
    {
        var user = await db.Usuarios
            .Where(u => (u.Email == request.Login || u.Login == request.Login)
                       && u.Contraseña == request.Password
                       && u.Activo)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new LoginResponse(user.UserId, user.Login, user.Email, user.Nombre, user.Apellido));
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("Login").WithOpenApi();

// Get user permissions endpoint - returns roles and allowed menu items
app.MapGet("/api/auth/permissions/{userId:int}", async (int userId, FastServiceDbContext db) =>
{
    try
    {
        var user = await db.Usuarios
            .Where(u => u.UserId == userId && u.Activo)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return Results.NotFound("Usuario no encontrado");
        }

        // Get user roles
        var userRoles = await (
            from ur in db.UsuarioRols
            join r in db.Roles on ur.RolId equals r.RolId
            where ur.UserId == userId
            select new UserRoleDto
            {
                RoleId = r.RolId,
                Name = r.Nombre
            }
        ).ToListAsync();

        // Get allowed menu items based on roles using subquery
        var allowedMenuItems = await (
            from rm in db.RoleMenus
            join im in db.ItemMenus on rm.ItemMenuId equals im.ItemMenuId
            where db.UsuarioRols.Any(ur => ur.UserId == userId && ur.RolId == rm.RolId)
                  && im.Estado
            select new MenuItemDto
            {
                ItemMenuId = im.ItemMenuId,
                Name = im.Name,
                Controller = im.Controlador,
                Action = im.Accion,
                Icon = im.Icon,
                Order = im.Orden
            }
        ).Distinct().OrderBy(m => m.Order).ToListAsync();

        // Determine access to specific modules based on controller names
        var controllerNames = allowedMenuItems
            .Where(m => m.Controller != null)
            .Select(m => m.Controller!.ToLower())
            .ToHashSet();

        var roleNames = userRoles.Select(r => r.Name.ToUpper()).ToHashSet();
        var roleIds = userRoles.Select(r => r.RoleId).ToHashSet();

        // Check if user has access to accounting:
        // 1. Has "Contabilidad" controller in menu items, OR
        // 2. Has any admin-like role (contains "admin" in name)
        var hasAdminRole = roleNames.Any(r => r.Contains("ADMIN"));
        
        // Role-based action permissions
        // Manager role: Gerente (1) - sees all actions with collapsible groups
        var isManager = roleIds.Contains(1);
        // Admin roles: FastServiceAdmin (3), Gerente (1), ElectroShopAdmin (2)
        var isAdmin = roleIds.Contains(1) || roleIds.Contains(2) || roleIds.Contains(3);
        // Tecnico role: Tecnico (4)
        var isTecnico = roleIds.Contains(4);

        var response = new UserPermissionsResponse
        {
            UserId = userId,
            UserName = $"{user.Nombre} {user.Apellido}".Trim(),
            Roles = userRoles,
            AllowedMenuItems = allowedMenuItems,
            CanAccessAccounting = controllerNames.Contains("contabilidad") || hasAdminRole,
            CanAccessOrders = true, // All authenticated users can access orders
            CanAccessKanban = true,  // All authenticated users can access kanban
            IsManager = isManager,
            IsAdmin = isAdmin,
            IsTecnico = isTecnico
        };

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetUserPermissions").WithOpenApi();

// Chat endpoint for basic interaction
app.MapPost("/api/chat", async (ChatRequest request, AgentService agentService) =>
{
    try
    {
        var agentResponse = await agentService.GetResponseAsync(request.Message, request.ConversationHistory, request.CanAccessAccounting, request.SelectedOrder);
        
        return Results.Ok(new ChatResponse(agentResponse.Message));
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("Chat").WithOpenApi();

// Advanced order search endpoint
app.MapGet("/api/orders/search", async (
    int? orderNumber,
    string? customerName,
    string? dni,
    string? status,
    [FromQuery(Name = "statuses")] string[]? statuses,
    string? brand,
    string? deviceType,
    string? model,
    DateTime? fromDate,
    DateTime? toDate,
    int? maxResults,
    OrderService orderService) =>
{
    try
    {
        var criteria = new OrderSearchCriteria
        {
            OrderNumber = orderNumber,
            CustomerName = customerName,
            DNI = dni,
            Status = status,
            Statuses = statuses?.ToList(),
            Brand = brand,
            DeviceType = deviceType,
            Model = model,
            FromDate = fromDate,
            ToDate = toDate,
            MaxResults = maxResults ?? 50
        };
        
        var orders = await orderService.SearchOrdersAsync(criteria);
        return Results.Ok(orders);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("SearchOrders").WithOpenApi();

// Get all repair statuses endpoint
app.MapGet("/api/statuses", async (OrderService orderService) =>
{
    try
    {
        var statuses = await orderService.GetAllStatusesAsync();
        return Results.Ok(statuses);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetAllStatuses").WithOpenApi();

// Order details endpoint
app.MapGet("/api/orders/{orderNumber:int}", async (int orderNumber, OrderService orderService) =>
{
    try
    {
        var order = await orderService.GetOrderDetailsAsync(orderNumber);
        if (order == null)
        {
            return Results.NotFound(new { message = $"Orden #{orderNumber} no encontrada" });
        }
        return Results.Ok(order);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetOrderDetails").WithOpenApi();

// Create new order endpoint
app.MapPost("/api/orders", async (CreateOrderRequest request, OrderService orderService) =>
{
    try
    {
        var order = await orderService.CreateOrderAsync(request);
        return Results.Created($"/api/orders/{order.OrderNumber}", order);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("CreateOrder").WithOpenApi();

// Update existing order endpoint
app.MapPut("/api/orders/{orderNumber:int}", async (int orderNumber, UpdateOrderRequest request, OrderService orderService) =>
{
    try
    {
        request.OrderNumber = orderNumber; // Ensure consistency
        var order = await orderService.UpdateOrderAsync(request);
        return Results.Ok(order);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("UpdateOrder").WithOpenApi();

// Order movements/comments endpoint
app.MapGet("/api/orders/{orderNumber:int}/movements", async (int orderNumber, OrderService orderService) =>
{
    try
    {
        var movements = await orderService.GetOrderMovementsAsync(orderNumber);
        return Results.Ok(movements);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetOrderMovements").WithOpenApi();

// Add novedad (note/movement) to an order
app.MapPost("/api/orders/{orderNumber:int}/novedades", async (int orderNumber, AddNovedadRequest request, OrderService orderService) =>
{
    try
    {
        request.OrderNumber = orderNumber; // Ensure consistency
        var movement = await orderService.AddNovedadAsync(request);
        return Results.Created($"/api/orders/{orderNumber}/movements", movement);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("AddNovedad").WithOpenApi();

// Delete a novedad (note/movement) from an order
app.MapDelete("/api/orders/{orderNumber:int}/novedades/{novedadId:int}", async (int orderNumber, int novedadId, OrderService orderService) =>
{
    try
    {
        await orderService.DeleteNovedadAsync(orderNumber, novedadId);
        return Results.Ok(new { message = $"Novedad #{novedadId} eliminada exitosamente" });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("DeleteNovedad").WithOpenApi();

// Delete an order (and all its related data)
app.MapDelete("/api/orders/{orderNumber:int}", async (int orderNumber, OrderService orderService) =>
{
    try
    {
        await orderService.DeleteOrderAsync(orderNumber);
        return Results.Ok(new { message = $"Orden #{orderNumber} eliminada exitosamente" });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("DeleteOrder").WithOpenApi();

// Process Retira (withdrawal) action on an order
app.MapPost("/api/orders/{orderNumber:int}/retira", async (int orderNumber, ProcessRetiraRequest request, OrderService orderService) =>
{
    try
    {
        request.OrderNumber = orderNumber; // Ensure consistency
        var result = await orderService.ProcessRetiraAsync(request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessRetira").WithOpenApi();

// Process Seña (deposit/advance payment) action on an order
app.MapPost("/api/orders/{orderNumber:int}/sena", async (int orderNumber, ProcessSenaRequest request, OrderService orderService) =>
{
    try
    {
        request.OrderNumber = orderNumber; // Ensure consistency
        var result = await orderService.ProcessSenaAsync(request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessSena").WithOpenApi();

// Process Informar Presupuesto - informs the customer of the quote
app.MapPost("/api/orders/{orderNumber:int}/informar-presupuesto", async (int orderNumber, InformarPresupuestoRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessInformarPresupuestoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessInformarPresupuesto").WithOpenApi();

// Process Reingreso - re-entry of equipment
app.MapPost("/api/orders/{orderNumber:int}/reingreso", async (int orderNumber, ReingresoRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessReingresoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessReingreso").WithOpenApi();

// Process Rechaza Presupuesto - CLIENT rejects the budget quote
app.MapPost("/api/orders/{orderNumber:int}/rechaza-presupuesto", async (int orderNumber, RechazaPresupuestoRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessRechazaPresupuestoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessRechazaPresupuesto").WithOpenApi();

// ===================== TÉCNICO ACTIONS =====================

// Process Presupuesto - TECHNICIAN creates a budget/quote
app.MapPost("/api/orders/{orderNumber:int}/presupuesto", async (int orderNumber, PresupuestoRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessPresupuestoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessPresupuesto").WithOpenApi();

// Process Reparado - TECHNICIAN marks order as repaired
app.MapPost("/api/orders/{orderNumber:int}/reparado", async (int orderNumber, ReparadoRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessReparadoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessReparado").WithOpenApi();

// Process Rechazar - TECHNICIAN can't repair (no parts, irreparable, etc.)
app.MapPost("/api/orders/{orderNumber:int}/rechazar", async (int orderNumber, RechazarRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessRechazarAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessRechazar").WithOpenApi();

// Process Espera Repuesto - TECHNICIAN marks order as waiting for parts
app.MapPost("/api/orders/{orderNumber:int}/espera-repuesto", async (int orderNumber, EsperaRepuestoRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessEsperaRepuestoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessEsperaRepuesto").WithOpenApi();

// Process Rep. Domicilio - TECHNICIAN completes home repair
app.MapPost("/api/orders/{orderNumber:int}/rep-domicilio", async (int orderNumber, RepDomicilioRequest request, OrderService orderService) =>
{
    try
    {
        var result = await orderService.ProcessRepDomicilioAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessRepDomicilio").WithOpenApi();

// Process Armado - TECHNICIAN assembles/packs equipment for pickup (rejected orders)
app.MapPost("/api/orders/{orderNumber:int}/armado", async (int orderNumber, ProcessArmadoRequest request, OrderService orderService) =>
{
    try
    {
        request.OrderNumber = orderNumber;
        var result = await orderService.ProcessArmadoAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessArmado").WithOpenApi();

// Process Archivar - ADMIN archives equipment to stock
app.MapPost("/api/orders/{orderNumber:int}/archivar", async (int orderNumber, ProcessArchivarRequest request, OrderService orderService) =>
{
    try
    {
        request.OrderNumber = orderNumber;
        var result = await orderService.ProcessArchivarAsync(orderNumber, request);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("ProcessArchivar").WithOpenApi();

// Get all payment methods
app.MapGet("/api/payment-methods", async (OrderService orderService) =>
{
    try
    {
        var methods = await orderService.GetMetodosPagoAsync();
        return Results.Ok(methods);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetPaymentMethods").WithOpenApi();

// Kanban board endpoint - returns orders grouped by status
app.MapGet("/api/orders/kanban", async (
    int? technicianId,
    int? responsibleId,
    int? businessId,
    DateTime? fromDate,
    DateTime? toDate,
    OrderService orderService) =>
{
    try
    {
        var board = await orderService.GetKanbanBoardAsync(
            technicianId, responsibleId, businessId, fromDate, toDate);
        return Results.Ok(board);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetKanbanBoard").WithOpenApi();

// T020: Technicians endpoint - returns active technicians (users)
app.MapGet("/api/technicians", async (FastServiceDbContext db) =>
{
    try
    {
        var technicians = await db.Usuarios
            .Where(u => u.Activo)
            .OrderBy(u => u.Apellido)
            .ThenBy(u => u.Nombre)
            .Select(u => new UserInfoDto(u.UserId, $"{u.Apellido}, {u.Nombre}"))
            .ToListAsync();
        return Results.Ok(technicians);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetTechnicians").WithOpenApi();

// T021: Responsibles endpoint - same as technicians (users can be both)
app.MapGet("/api/responsibles", async (FastServiceDbContext db) =>
{
    try
    {
        var responsibles = await db.Usuarios
            .Where(u => u.Activo)
            .OrderBy(u => u.Apellido)
            .ThenBy(u => u.Nombre)
            .Select(u => new UserInfoDto(u.UserId, $"{u.Apellido}, {u.Nombre}"))
            .ToListAsync();
        return Results.Ok(responsibles);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetResponsibles").WithOpenApi();

// T022: Businesses endpoint - returns active businesses
app.MapGet("/api/businesses", async (FastServiceDbContext db) =>
{
    try
    {
        var businesses = await db.Comercios
            .Where(c => c.Activo)
            .OrderBy(c => c.Descripcion)
            .Select(c => new BusinessInfoDto(c.ComercioId, c.Descripcion ?? c.Code ?? "Sin nombre"))
            .ToListAsync();
        return Results.Ok(businesses);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetBusinesses").WithOpenApi();

// T023: Device Types endpoint - returns active device types
app.MapGet("/api/device-types", async (FastServiceDbContext db) =>
{
    try
    {
        var deviceTypes = await db.TipoDispositivos
            .Where(t => t.Activo && t.Nombre.Trim() != string.Empty)
            .OrderBy(t => t.Nombre)
            .Select(t => new DropdownItemDto(t.TipoDispositivoId, t.Nombre))
            .ToListAsync();
        return Results.Ok(deviceTypes);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetDeviceTypes").WithOpenApi();

// T024: Brands endpoint - returns active brands
app.MapGet("/api/brands", async (FastServiceDbContext db) =>
{
    try
    {
        var brands = await db.Marcas
            .Where(m => m.Activo && m.Nombre.Trim() != string.Empty)
            .OrderBy(m => m.Nombre)
            .Select(m => new DropdownItemDto(m.MarcaId, m.Nombre))
            .ToListAsync();
        return Results.Ok(brands);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetBrands").WithOpenApi();

// T025: Comercios endpoint - returns active comercios for warranty cases
app.MapGet("/api/comercios", async (FastServiceDbContext db) =>
{
    try
    {
        var comercios = await db.Comercios
            .Where(c => c.Activo && c.Code != null && c.Code.Trim() != string.Empty)
            .OrderBy(c => c.Code)
            .Select(c => new ComercioDto(c.ComercioId, c.Code!, c.Telefono))
            .ToListAsync();
        return Results.Ok(comercios);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetComercios").WithOpenApi();

// =============================================================================
// Client endpoints
// =============================================================================

// Get clients list with pagination and search
app.MapGet("/api/clients", async (
    string? search,
    int? page,
    int? pageSize,
    ClientService clientService) =>
{
    try
    {
        var result = await clientService.GetClientsAsync(
            search,
            page ?? 1,
            pageSize ?? 20);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetClients").WithOpenApi();

// Get client details by ID
app.MapGet("/api/clients/{clienteId:int}", async (int clienteId, ClientService clientService) =>
{
    try
    {
        var client = await clientService.GetClientDetailsAsync(clienteId);
        if (client == null)
        {
            return Results.NotFound(new { message = $"Cliente #{clienteId} no encontrado" });
        }
        return Results.Ok(client);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetClientDetails").WithOpenApi();

// Get client by DNI (exact match - for autocomplete)
app.MapGet("/api/clients/by-dni/{dni}", async (string dni, ClientService clientService) =>
{
    try
    {
        var client = await clientService.GetClientByDniAsync(dni);
        if (client == null)
        {
            return Results.NotFound(new { message = "Cliente no encontrado" });
        }
        return Results.Ok(client);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetClientByDni").WithOpenApi();

// Search clients (for autocomplete suggestions)
app.MapGet("/api/clients/search/{prefix}", async (string prefix, int? maxResults, ClientService clientService) =>
{
    try
    {
        var clients = await clientService.SearchClientsAsync(prefix, maxResults ?? 10);
        return Results.Ok(clients);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("SearchClients").WithOpenApi();

// Temporary admin endpoint to update user password
app.MapPost("/api/admin/update-password", async (UpdatePasswordRequest request, FastServiceDbContext db) =>
{
    try
    {
        var user = await db.Usuarios.FirstOrDefaultAsync(u => u.Nombre == request.UserName);
        if (user == null)
        {
            return Results.NotFound(new { error = $"User '{request.UserName}' not found" });
        }
        user.Contraseña = request.NewPassword;
        await db.SaveChangesAsync();
        return Results.Ok(new { success = true, message = $"Password updated for user {request.UserName}" });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
});

// ===== WhatsApp Templates API =====

// Get all WhatsApp templates (admin view)
app.MapGet("/api/whatsapp/templates", async (WhatsAppService whatsAppService) =>
{
    try
    {
        var templates = await whatsAppService.GetAllTemplatesAdminAsync();
        return Results.Ok(templates);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetWhatsAppTemplates").WithOpenApi();

// Get single WhatsApp template by ID
app.MapGet("/api/whatsapp/templates/{templateId:int}", async (int templateId, WhatsAppService whatsAppService) =>
{
    try
    {
        var template = await whatsAppService.GetTemplateByIdAsync(templateId);
        if (template == null)
        {
            return Results.NotFound(new { message = "Template no encontrado" });
        }
        return Results.Ok(template);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetWhatsAppTemplateById").WithOpenApi();

// Get templates for a specific repair state
app.MapGet("/api/whatsapp/templates/state/{estadoReparacionId:int}", async (int estadoReparacionId, WhatsAppService whatsAppService) =>
{
    try
    {
        var templates = await whatsAppService.GetTemplatesForStateAsync(estadoReparacionId);
        return Results.Ok(templates);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetWhatsAppTemplatesForState").WithOpenApi();

// Get reminder templates
app.MapGet("/api/whatsapp/templates/reminders", async (WhatsAppService whatsAppService) =>
{
    try
    {
        var templates = await whatsAppService.GetReminderTemplatesAsync();
        return Results.Ok(templates);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GetReminderTemplates").WithOpenApi();

// Create new WhatsApp template
app.MapPost("/api/whatsapp/templates", async (WhatsAppTemplateCreateDto dto, WhatsAppService whatsAppService) =>
{
    try
    {
        var template = await whatsAppService.CreateTemplateAsync(dto);
        return Results.Created($"/api/whatsapp/templates/{template.WhatsAppTemplateId}", template);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("CreateWhatsAppTemplate").WithOpenApi();

// Update WhatsApp template
app.MapPut("/api/whatsapp/templates/{templateId:int}", async (int templateId, WhatsAppTemplateUpdateDto dto, WhatsAppService whatsAppService) =>
{
    try
    {
        var template = await whatsAppService.UpdateTemplateAsync(templateId, dto);
        if (template == null)
        {
            return Results.NotFound(new { message = "Template no encontrado" });
        }
        return Results.Ok(template);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("UpdateWhatsAppTemplate").WithOpenApi();

// Delete WhatsApp template
app.MapDelete("/api/whatsapp/templates/{templateId:int}", async (int templateId, WhatsAppService whatsAppService) =>
{
    try
    {
        var result = await whatsAppService.DeleteTemplateAsync(templateId);
        if (!result)
        {
            return Results.NotFound(new { message = "Template no encontrado" });
        }
        return Results.Ok(new { success = true });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("DeleteWhatsAppTemplate").WithOpenApi();

// Generate message from template for an order
app.MapGet("/api/whatsapp/templates/{templateId:int}/generate/{orderNumber:int}", async (int templateId, int orderNumber, WhatsAppService whatsAppService) =>
{
    try
    {
        var message = await whatsAppService.GenerateMessageAsync(templateId, orderNumber);
        return Results.Ok(message);
    }
    catch (ArgumentException ex)
    {
        return Results.NotFound(new { message = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GenerateWhatsAppMessage").WithOpenApi();

// Generate message for order using default template for its current state
app.MapGet("/api/whatsapp/generate/{orderNumber:int}", async (int orderNumber, FastServiceDbContext db, WhatsAppService whatsAppService) =>
{
    try
    {
        // Get the order's current state
        var reparacion = await db.Reparacions.FindAsync(orderNumber);
        if (reparacion == null)
        {
            return Results.NotFound(new { message = $"Orden #{orderNumber} no encontrada" });
        }

        var message = await whatsAppService.GenerateMessageForStateAsync(orderNumber, reparacion.EstadoReparacionId);
        if (message == null)
        {
            return Results.NotFound(new { message = "No hay template disponible para el estado actual" });
        }
        return Results.Ok(message);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("GenerateWhatsAppMessageForOrder").WithOpenApi();

// Get available placeholders for templates
app.MapGet("/api/whatsapp/placeholders", () =>
{
    var placeholders = WhatsAppService.GetAvailablePlaceholders()
        .Select(p => new PlaceholderInfoDto { Placeholder = p.Key, Description = p.Value })
        .ToList();
    return Results.Ok(placeholders);
}).WithName("GetWhatsAppPlaceholders").WithOpenApi();

app.Run();

record UpdatePasswordRequest(string UserName, string NewPassword);
record ChatRequest(string Message, List<ConversationMessage>? ConversationHistory = null, bool CanAccessAccounting = false, SelectedOrderContext? SelectedOrder = null);
record ChatResponse(string Message);
record UserInfoDto(int Id, string Name);
record BusinessInfoDto(int Id, string Name);
record DropdownItemDto(int Id, string Name);
record ComercioDto(int Id, string Code, string? Telefono);
