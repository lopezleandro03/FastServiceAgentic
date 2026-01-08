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

app.Run();

record ChatRequest(string Message, List<ConversationMessage>? ConversationHistory = null);
record ChatResponse(string Message);
