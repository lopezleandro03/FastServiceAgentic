using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
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
// In-memory cache for short-lived caching of hot reads
builder.Services.AddMemoryCache();
// Pre-load last 100 orders on startup for fast lookups
builder.Services.AddSingleton<OrderCacheService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<OrderCacheService>());

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

app.Run();

record ChatRequest(string Message, List<ConversationMessage>? ConversationHistory = null);
record ChatResponse(string Message);
record UserInfoDto(int Id, string Name);
record BusinessInfoDto(int Id, string Name);
