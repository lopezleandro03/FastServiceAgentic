using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Data.Entities;
using FastService.McpServer.Services;
using FastService.McpServer.Tools;
using FastService.McpServer.Dtos;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext
builder.Services.AddDbContext<FastServiceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FastServiceDb")));

// Register application services
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<OrderSearchTools>();
builder.Services.AddScoped<AgentService>();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// MCP Server configuration will be added in later phases

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

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

// Chat endpoint for basic interaction
app.MapPost("/api/chat", async (ChatRequest request, AgentService agentService) =>
{
    try
    {
        var response = await agentService.GetResponseAsync(request.Message, request.ConversationHistory);
        return Results.Ok(new ChatResponse(response));
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}).WithName("Chat").WithOpenApi();

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

app.Run();

record ChatRequest(string Message, List<ConversationMessage>? ConversationHistory = null);
record ChatResponse(string Message);
record UserInfoDto(int Id, string Name);
record BusinessInfoDto(int Id, string Name);
record DropdownItemDto(int Id, string Name);
record ComercioDto(int Id, string Code, string? Telefono);
