using Azure.AI.OpenAI;
using Azure;
using OpenAI.Chat;
using FastService.McpServer.Tools;
using FastService.McpServer.Dtos;
using System.Text.Json;

namespace FastService.McpServer.Services
{
    public class AgentService
    {
        private readonly ChatClient _chatClient;
        private readonly OrderSearchTools _orderSearchTools;
        private readonly ILogger<AgentService> _logger;
        private readonly List<ChatTool> _tools;

        public AgentService(IConfiguration configuration, OrderSearchTools orderSearchTools, ILogger<AgentService> logger)
        {
            _logger = logger;
            _orderSearchTools = orderSearchTools;

            var endpoint = configuration["AzureOpenAI:Endpoint"] ?? throw new InvalidOperationException("AzureOpenAI:Endpoint not configured");
            var apiKey = configuration["AzureOpenAI:ApiKey"] ?? throw new InvalidOperationException("AzureOpenAI:ApiKey not configured");
            var deploymentName = configuration["AzureOpenAI:DeploymentName"] ?? throw new InvalidOperationException("AzureOpenAI:DeploymentName not configured");

            var azureClient = new AzureOpenAIClient(new Uri(endpoint), new AzureKeyCredential(apiKey));
            _chatClient = azureClient.GetChatClient(deploymentName);
            
            _tools = DefineChatTools();
        }

        private List<ChatTool> DefineChatTools()
        {
            return new List<ChatTool>
            {
                ChatTool.CreateFunctionTool(
                    functionName: "SearchOrdersByNumber",
                    functionDescription: "Search for a repair order by its order number. Returns complete details including customer, device, repair status, and dates.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "orderNumber": {
                                "type": "integer",
                                "description": "The repair order number to search for"
                            }
                        },
                        "required": ["orderNumber"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "SearchOrdersByCustomer",
                    functionDescription: "Search for repair orders by customer name. Supports partial name matching (fuzzy search).",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "customerName": {
                                "type": "string",
                                "description": "The customer name to search for (partial matches allowed)"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 10
                            }
                        },
                        "required": ["customerName"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "SearchOrdersByStatus",
                    functionDescription: "Search for repair orders by repair status (e.g., 'Pendiente', 'En reparación', 'Finalizado').",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "string",
                                "description": "The repair status to filter by"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 20
                            }
                        },
                        "required": ["status"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "SearchOrdersByDNI",
                    functionDescription: "Search for repair orders by customer DNI (national ID number).",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "dni": {
                                "type": "string",
                                "description": "The customer DNI to search for"
                            }
                        },
                        "required": ["dni"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "SearchOrdersByDevice",
                    functionDescription: "Search for repair orders by device brand and/or device type.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "brand": {
                                "type": "string",
                                "description": "The device brand (e.g., 'Samsung', 'iPhone')"
                            },
                            "deviceType": {
                                "type": "string",
                                "description": "The device type (e.g., 'Celular', 'Tablet', 'Notebook')"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 15
                            }
                        }
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetAllStatuses",
                    functionDescription: "Get all available repair statuses in the system.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {}
                    }
                    """)
                )
            };
        }

        public async Task<string> GetResponseAsync(string userMessage, List<ConversationMessage>? conversationHistory = null)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage(@"Eres un asistente virtual para FastService, un sistema de gestión de taller de reparaciones. 
Tu objetivo es ayudar a los usuarios a buscar órdenes de reparación y proporcionar información sobre ellas.

IDIOMA: Comunícate SIEMPRE en español con el usuario. Puedes entender consultas en inglés, pero TODAS tus respuestas deben estar en español.

=== HERRAMIENTAS DISPONIBLES ===
Tienes acceso a las siguientes herramientas para buscar en la base de datos:

- SearchOrdersByNumber: Buscar una orden por su número de orden
- SearchOrdersByCustomer: Buscar órdenes por nombre del cliente (soporta coincidencias parciales)
- SearchOrdersByStatus: Buscar órdenes por estado de reparación
- SearchOrdersByDNI: Buscar órdenes por DNI del cliente
- SearchOrdersByDevice: Buscar órdenes por marca y/o tipo de dispositivo
- GetAllStatuses: Listar todos los estados de reparación disponibles

=== CONTEXTO DEL DOMINIO FASTSERVICE ===

**Terminología FastService (español ↔ inglés):**
- Orden/Orden de reparación = Order/Repair order
- Reparación = Repair
- Cliente = Customer
- Técnico = Technician
- Dispositivo/Equipo = Device/Equipment
- Presupuesto = Quote/Estimate
- Garantía = Warranty
- Ingreso = Entry/Intake
- Entrega = Delivery
- Estado = Status
- Pendiente = Pending
- Finalizado = Completed

**Tipos de Dispositivos Comunes:**
- Celular/Móvil (Phone): iPhone, Samsung, Motorola, Xiaomi, LG
- Tablet: iPad, Samsung Tab, tablets Android
- Notebook/Laptop: Dell, HP, Lenovo, Asus, MacBook
- TV/Televisor: Samsung, LG, Sony, Philips (LED, LCD, Smart TV)
- Consola: PlayStation, Xbox, Nintendo
- Electrodomésticos: Microondas, heladera, lavarropas, aire acondicionado

**Estados de Reparación (flujo de trabajo):**

1. **Ingresados** - Orden recién creada, equipo recibido
2. **Pendiente** - Esperando diagnóstico o evaluación inicial
3. **Evaluando** - Técnico está diagnosticando el problema
4. **Presupuestado** - Se generó presupuesto, esperando aprobación del cliente
5. **Aprobado** - Cliente aprobó el presupuesto, listo para reparar
6. **En reparación** - Técnico está trabajando en la reparación
7. **Reparado** - Reparación completada, listo para pruebas
8. **Finalizado** - Orden completada, listo para entregar
9. **Entregado** - Equipo entregado al cliente
10. **Rechazado** - Cliente rechazó el presupuesto o reparación
11. **Garantía** - Reparación en garantía
12. **Visitando** - Técnico visitando domicilio del cliente

**Interpretación de Estados:**
- ""¿Qué órdenes están pendientes?"" → buscar estados: Pendiente, Evaluando, Presupuestado
- ""¿Cuáles están en proceso?"" → buscar: En reparación, Reparado
- ""¿Cuáles están listas?"" → buscar: Finalizado
- ""¿Qué reparaciones están activas?"" → excluir: Entregado, Rechazado

=== FORMATO DE RESPUESTA ===

**Para búsquedas con MÚLTIPLES órdenes:**
SIEMPRE incluye un bloque JSON con los datos, seguido de un resumen en español:

```json
[
  {
    ""orderNumber"": 123,
    ""customerName"": ""Juan Pérez"",
    ""deviceInfo"": ""Samsung LED TV"",
    ""status"": ""Presupuestado"",
    ""entryDate"": ""2026-01-05"",
    ""estimatedPrice"": 5000
  }
]
```

Luego agrega: ""Encontré X órdenes para [criterio de búsqueda]. [Observación relevante]""

**Para una orden ESPECÍFICA (SearchOrdersByNumber):**
Usa formato de texto descriptivo en español:
""Orden #12345 - Cliente: Juan Pérez
Dispositivo: Samsung LED TV
Estado: Presupuestado ($5,000)
Ingresado: 05/01/2026
Técnico: Carlos Gómez""

**Para consultas sin resultados:**
Proporciona sugerencias útiles:
""No encontré órdenes con ese criterio. Podés intentar:
- Buscar por nombre del cliente
- Buscar por número de orden
- Verificar el estado de las órdenes""

=== MANEJO DE CONTEXTO ===
- Recordá el contexto de conversaciones previas
- Si el usuario pregunta ""¿Cuál es el estado de esa orden?"" después de ver resultados, referite a la orden mencionada
- Mantené un tono amigable, profesional y servicial
- Usá lenguaje natural argentino/rioplatense (""vos"", ""podés"", etc.)

=== EJEMPLOS DE INTERACCIÓN ===

Usuario: ""Buscá órdenes de Samsung""
Asistente: [Llama SearchOrdersByDevice con brand=""Samsung""] + responde en español con JSON y resumen

Usuario: ""¿Qué órdenes están pendientes?""
Asistente: [Llama SearchOrdersByStatus con status=""Pendiente""] + responde en español

Usuario: ""Mostrá la orden 12345""
Asistente: [Llama SearchOrdersByNumber] + responde con formato descriptivo en español

Siempre sé conciso, amigable y profesional en tus respuestas.")
                };

                // Add conversation history if provided
                if (conversationHistory != null && conversationHistory.Count > 0)
                {
                    foreach (var historyMessage in conversationHistory)
                    {
                        if (historyMessage.Role.ToLower() == "user")
                        {
                            messages.Add(new UserChatMessage(historyMessage.Content));
                        }
                        else if (historyMessage.Role.ToLower() == "assistant")
                        {
                            messages.Add(new AssistantChatMessage(historyMessage.Content));
                        }
                    }
                }

                // Add current user message
                messages.Add(new UserChatMessage(userMessage));

                var chatOptions = new ChatCompletionOptions();
                foreach (var tool in _tools)
                {
                    chatOptions.Tools.Add(tool);
                }

                bool requiresAnotherCall;
                do
                {
                    requiresAnotherCall = false;
                    var response = await _chatClient.CompleteChatAsync(messages, chatOptions);
                    
                    var choice = response.Value;
                    
                    // Add assistant's response to messages
                    messages.Add(new AssistantChatMessage(choice));

                    // Check if the model wants to call tools
                    if (choice.FinishReason == ChatFinishReason.ToolCalls)
                    {
                        requiresAnotherCall = true;
                        
                        foreach (var toolCall in choice.ToolCalls)
                        {
                            _logger.LogInformation("Tool called: {FunctionName} with args: {Arguments}", 
                                toolCall.FunctionName, toolCall.FunctionArguments.ToString());

                            string toolResult = await ExecuteToolAsync(toolCall.FunctionName, toolCall.FunctionArguments.ToString());
                            
                            messages.Add(new ToolChatMessage(toolCall.Id, toolResult));
                        }
                    }
                    else
                    {
                        // Return the final response
                        return choice.Content[0].Text;
                    }
                    
                } while (requiresAnotherCall);

                return "I apologize, but I encountered an issue processing your request.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI response for message: {Message}", userMessage);
                throw;
            }
        }

        private async Task<string> ExecuteToolAsync(string functionName, string arguments)
        {
            try
            {
                var args = JsonDocument.Parse(arguments);
                
                return functionName switch
                {
                    "SearchOrdersByNumber" => await _orderSearchTools.SearchOrdersByNumberAsync(
                        args.RootElement.GetProperty("orderNumber").GetInt32()),
                    
                    "SearchOrdersByCustomer" => await _orderSearchTools.SearchOrdersByCustomerAsync(
                        args.RootElement.GetProperty("customerName").GetString()!,
                        args.RootElement.TryGetProperty("maxResults", out var maxResults) ? maxResults.GetInt32() : 10),
                    
                    "SearchOrdersByStatus" => await _orderSearchTools.SearchOrdersByStatusAsync(
                        args.RootElement.GetProperty("status").GetString()!,
                        args.RootElement.TryGetProperty("maxResults", out var maxRes) ? maxRes.GetInt32() : 20),
                    
                    "SearchOrdersByDNI" => await _orderSearchTools.SearchOrdersByDNIAsync(
                        args.RootElement.GetProperty("dni").GetString()!),
                    
                    "SearchOrdersByDevice" => await _orderSearchTools.SearchOrdersByDeviceAsync(
                        args.RootElement.TryGetProperty("brand", out var brand) ? brand.GetString() : null,
                        args.RootElement.TryGetProperty("deviceType", out var deviceType) ? deviceType.GetString() : null,
                        args.RootElement.TryGetProperty("maxResults", out var maxDev) ? maxDev.GetInt32() : 15),
                    
                    "GetAllStatuses" => await _orderSearchTools.GetAllStatusesAsync(),
                    
                    _ => JsonSerializer.Serialize(new { success = false, message = $"Unknown function: {functionName}" })
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing tool {FunctionName}", functionName);
                return JsonSerializer.Serialize(new 
                { 
                    success = false, 
                    message = $"Error executing {functionName}: {ex.Message}" 
                });
            }
        }
    }
}
