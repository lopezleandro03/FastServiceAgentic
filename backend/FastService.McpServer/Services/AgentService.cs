using Azure.AI.OpenAI;
using Azure;
using OpenAI.Chat;
using FastService.McpServer.Tools;
using FastService.McpServer.Dtos;
using System.Text.Json;

namespace FastService.McpServer.Services
{
    /// <summary>
    /// Response from the AI agent.
    /// </summary>
    public class AgentResponse
    {
        public string Message { get; set; } = "";
    }

    /// <summary>
    /// Service that orchestrates AI chat interactions using Azure OpenAI.
    /// Integrates with MCP tools for order, customer, and accounting queries.
    /// Maintains backward compatibility with the existing web app chat interface.
    /// </summary>
    public class AgentService
    {
        private readonly ChatClient _chatClient;
        private readonly OrderSearchTools _orderSearchTools;
        private readonly CustomerTools _customerTools;
        private readonly AccountingTools _accountingTools;
        private readonly OrderUpdateTools _orderUpdateTools;
        private readonly ILogger<AgentService> _logger;
        private readonly List<ChatTool> _tools;

        public AgentService(
            IConfiguration configuration, 
            OrderSearchTools orderSearchTools,
            CustomerTools customerTools,
            AccountingTools accountingTools,
            OrderUpdateTools orderUpdateTools,
            ILogger<AgentService> logger)
        {
            _logger = logger;
            _orderSearchTools = orderSearchTools;
            _customerTools = customerTools;
            _accountingTools = accountingTools;
            _orderUpdateTools = orderUpdateTools;

            var endpoint = configuration["AzureOpenAI:Endpoint"] ?? throw new InvalidOperationException("AzureOpenAI:Endpoint not configured");
            var apiKey = configuration["AzureOpenAI:ApiKey"] ?? throw new InvalidOperationException("AzureOpenAI:ApiKey not configured");
            var deploymentName = configuration["AzureOpenAI:DeploymentName"] ?? throw new InvalidOperationException("AzureOpenAI:DeploymentName not configured");

            var azureClient = new AzureOpenAIClient(new Uri(endpoint), new AzureKeyCredential(apiKey));
            _chatClient = azureClient.GetChatClient(deploymentName);
            
            _tools = DefineChatTools();
        }

        /// <summary>
        /// Defines all available chat tools, including order, customer, and accounting tools.
        /// These definitions match the MCP tool attributes for consistency.
        /// </summary>
        private List<ChatTool> DefineChatTools()
        {
            return new List<ChatTool>
            {
                // === ORDER TOOLS ===
                ChatTool.CreateFunctionTool(
                    functionName: "SearchOrderByNumber",
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
                    functionName: "SearchOrdersByAddress",
                    functionDescription: "Search for repair orders by customer address. Supports partial address matching (street name, neighborhood, city).",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "address": {
                                "type": "string",
                                "description": "The address to search for (street name, neighborhood, or city)"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 15
                            }
                        },
                        "required": ["address"]
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
                    functionName: "SearchOrdersByModel",
                    functionDescription: "Search for repair orders by device model name (fuzzy match) and optionally filter by repair status. Common use: find orders for specific device models like 'iPhone 14', 'Galaxy S23', 'MacBook Pro'.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "model": {
                                "type": "string",
                                "description": "The device model to search for (partial matches allowed, e.g., 'iPhone 14', 'Galaxy', 'MacBook')"
                            },
                            "status": {
                                "type": "string",
                                "description": "Optional: Filter by repair status (e.g., 'Pendiente', 'En reparación', 'Finalizado')"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 20
                            }
                        },
                        "required": ["model"]
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
                ),

                // === CUSTOMER TOOLS ===
                ChatTool.CreateFunctionTool(
                    functionName: "SearchCustomerByName",
                    functionDescription: "Search for customers by name, address or phone. This opens the Clients screen with search results. Use this when user wants to find/lookup a customer. Tell the user they are being redirected to see the results.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "The customer name to search for (partial matches allowed)"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 10
                            }
                        },
                        "required": ["name"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetCustomerByDNI",
                    functionDescription: "Get customer details by their DNI (national ID number).",
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
                    functionName: "GetCustomerById",
                    functionDescription: "Get complete customer details including order history by customer ID.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "customerId": {
                                "type": "integer",
                                "description": "The customer ID"
                            }
                        },
                        "required": ["customerId"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetCustomerOrderHistory",
                    functionDescription: "Get the repair order history for a specific customer.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "customerId": {
                                "type": "integer",
                                "description": "The customer ID"
                            },
                            "maxResults": {
                                "type": "integer",
                                "description": "Maximum number of orders to return",
                                "default": 20
                            }
                        },
                        "required": ["customerId"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetCustomerStats",
                    functionDescription: "Get statistics for a customer including total orders, spending, and repair history.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "customerId": {
                                "type": "integer",
                                "description": "The customer ID"
                            }
                        },
                        "required": ["customerId"]
                    }
                    """)
                ),

                // === ACCOUNTING TOOLS ===
                ChatTool.CreateFunctionTool(
                    functionName: "GetSalesSummary",
                    functionDescription: "Get sales summary totals for today, this week, this month, and this year. Returns amounts with and without invoice.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {}
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetSalesForPeriod",
                    functionDescription: "Get detailed sales chart data for a specific period (day, week, month, or year).",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "period": {
                                "type": "string",
                                "description": "The period to get data for: 'd' for day (hourly), 'w' for week (daily), 'm' for month (daily), 'y' for year (monthly)"
                            },
                            "year": {
                                "type": "integer",
                                "description": "The year to query (defaults to current year)"
                            },
                            "month": {
                                "type": "integer",
                                "description": "The month to query for monthly view, 1-12 (defaults to current month)"
                            }
                        },
                        "required": ["period"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetSalesByPaymentMethod",
                    functionDescription: "Get sales breakdown by payment method for a date range.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "startDate": {
                                "type": "string",
                                "description": "Start date in YYYY-MM-DD format (defaults to start of current month)"
                            },
                            "endDate": {
                                "type": "string",
                                "description": "End date in YYYY-MM-DD format (defaults to today)"
                            }
                        }
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "GetRecentSales",
                    functionDescription: "Get the most recent sales transactions.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "count": {
                                "type": "integer",
                                "description": "Number of recent sales to return",
                                "default": 20
                            },
                            "invoiced": {
                                "type": "boolean",
                                "description": "Filter by invoiced status: true for invoiced only, false for non-invoiced only, null for all"
                            }
                        }
                    }
                    """)
                ),

                // === ORDER UPDATE TOOLS ===
                ChatTool.CreateFunctionTool(
                    functionName: "UpdateOrderField",
                    functionDescription: "Update a specific field of an existing order. Use when the user wants to modify a single field like phone, email, address, model, etc. Supported fields: telefono, telefono2, email, direccion, localidad, modelo, serie, accesorios, ubicacion, presupuesto, precio.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "orderNumber": {
                                "type": "integer",
                                "description": "Order number to update"
                            },
                            "field": {
                                "type": "string",
                                "description": "Field to update: telefono, telefono2, email, direccion, localidad, modelo, serie, accesorios, ubicacion, presupuesto, precio"
                            },
                            "newValue": {
                                "type": "string",
                                "description": "New value for the field"
                            }
                        },
                        "required": ["orderNumber", "field", "newValue"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "UpdateCustomerInfo",
                    functionDescription: "Update multiple customer contact fields at once for an order.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "orderNumber": {
                                "type": "integer",
                                "description": "Order number"
                            },
                            "telefono": {
                                "type": "string",
                                "description": "Primary phone number"
                            },
                            "telefono2": {
                                "type": "string",
                                "description": "Secondary phone number"
                            },
                            "email": {
                                "type": "string",
                                "description": "Email address"
                            },
                            "direccion": {
                                "type": "string",
                                "description": "Address"
                            },
                            "localidad": {
                                "type": "string",
                                "description": "City/locality"
                            }
                        },
                        "required": ["orderNumber"]
                    }
                    """)
                ),
                ChatTool.CreateFunctionTool(
                    functionName: "UpdateDeviceInfo",
                    functionDescription: "Update device/equipment information for an order.",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "orderNumber": {
                                "type": "integer",
                                "description": "Order number"
                            },
                            "modelo": {
                                "type": "string",
                                "description": "Device model"
                            },
                            "serie": {
                                "type": "string",
                                "description": "Serial number"
                            },
                            "ubicacion": {
                                "type": "string",
                                "description": "Location/shelf"
                            },
                            "accesorios": {
                                "type": "string",
                                "description": "Accessories"
                            }
                        },
                        "required": ["orderNumber"]
                    }
                    """)
                )
            };
        }

        public async Task<AgentResponse> GetResponseAsync(string userMessage, List<ConversationMessage>? conversationHistory = null, bool canAccessAccounting = false, SelectedOrderContext? selectedOrder = null)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage(GetSystemPrompt(canAccessAccounting, selectedOrder))
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

                            string toolResult = await ExecuteToolAsync(toolCall.FunctionName, toolCall.FunctionArguments.ToString(), canAccessAccounting);
                            
                            messages.Add(new ToolChatMessage(toolCall.Id, toolResult));
                        }
                    }
                    else
                    {
                        // Return the final response
                        return new AgentResponse
                        {
                            Message = choice.Content[0].Text
                        };
                    }
                    
                } while (requiresAnotherCall);

                return new AgentResponse { Message = "I apologize, but I encountered an issue processing your request." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI response for message: {Message}", userMessage);
                throw;
            }
        }

        /// <summary>
        /// Executes the specified tool with the given arguments.
        /// Routes to the appropriate MCP tool implementation.
        /// </summary>
        private async Task<string> ExecuteToolAsync(string functionName, string arguments, bool canAccessAccounting = false)
        {
            try
            {
                // Block accounting tools if user doesn't have access
                var accountingTools = new[] { "GetSalesSummary", "GetSalesForPeriod", "GetSalesByPaymentMethod", "GetRecentSales" };
                if (accountingTools.Contains(functionName) && !canAccessAccounting)
                {
                    return JsonSerializer.Serialize(new 
                    { 
                        success = false, 
                        message = "No tenés permisos para acceder a la información de contabilidad." 
                    });
                }

                var args = JsonDocument.Parse(arguments);
                
                return functionName switch
                {
                    // Order Tools
                    "SearchOrderByNumber" => await _orderSearchTools.SearchOrdersByNumberAsync(
                        args.RootElement.GetProperty("orderNumber").GetInt32()),
                    
                    "SearchOrdersByCustomer" => await _orderSearchTools.SearchOrdersByCustomerAsync(
                        args.RootElement.GetProperty("customerName").GetString()!,
                        args.RootElement.TryGetProperty("maxResults", out var maxResults) ? maxResults.GetInt32() : 10),
                    
                    "SearchOrdersByStatus" => await _orderSearchTools.SearchOrdersByStatusAsync(
                        args.RootElement.GetProperty("status").GetString()!,
                        args.RootElement.TryGetProperty("maxResults", out var maxRes) ? maxRes.GetInt32() : 20),
                    
                    "SearchOrdersByDNI" => await _orderSearchTools.SearchOrdersByDNIAsync(
                        args.RootElement.GetProperty("dni").GetString()!),
                    
                    "SearchOrdersByAddress" => await _orderSearchTools.SearchOrdersByAddressAsync(
                        args.RootElement.GetProperty("address").GetString()!,
                        args.RootElement.TryGetProperty("maxResults", out var maxAddr) ? maxAddr.GetInt32() : 15),
                    
                    "SearchOrdersByDevice" => await _orderSearchTools.SearchOrdersByDeviceAsync(
                        args.RootElement.TryGetProperty("brand", out var brand) ? brand.GetString() : null,
                        args.RootElement.TryGetProperty("deviceType", out var deviceType) ? deviceType.GetString() : null,
                        args.RootElement.TryGetProperty("maxResults", out var maxDev) ? maxDev.GetInt32() : 15),
                    
                    "SearchOrdersByModel" => await _orderSearchTools.SearchOrdersByModelAsync(
                        args.RootElement.GetProperty("model").GetString()!,
                        args.RootElement.TryGetProperty("status", out var modelStatus) ? modelStatus.GetString() : null,
                        args.RootElement.TryGetProperty("maxResults", out var maxModel) ? maxModel.GetInt32() : 20),
                    
                    "GetAllStatuses" => await _orderSearchTools.GetAllStatusesAsync(),

                    // Customer Tools
                    "SearchCustomerByName" => await _customerTools.SearchCustomerByNameAsync(
                        args.RootElement.GetProperty("name").GetString()!,
                        args.RootElement.TryGetProperty("maxResults", out var maxCust) ? maxCust.GetInt32() : 10),
                    
                    "GetCustomerByDNI" => await _customerTools.GetCustomerByDNIAsync(
                        args.RootElement.GetProperty("dni").GetString()!),
                    
                    "GetCustomerById" => await _customerTools.GetCustomerByIdAsync(
                        args.RootElement.GetProperty("customerId").GetInt32()),
                    
                    "GetCustomerOrderHistory" => await _customerTools.GetCustomerOrderHistoryAsync(
                        args.RootElement.GetProperty("customerId").GetInt32(),
                        args.RootElement.TryGetProperty("maxResults", out var maxHist) ? maxHist.GetInt32() : 20),
                    
                    "GetCustomerStats" => await _customerTools.GetCustomerStatsAsync(
                        args.RootElement.GetProperty("customerId").GetInt32()),

                    // Accounting Tools
                    "GetSalesSummary" => await _accountingTools.GetSalesSummaryAsync(),
                    
                    "GetSalesForPeriod" => await _accountingTools.GetSalesForPeriodAsync(
                        args.RootElement.GetProperty("period").GetString()!,
                        args.RootElement.TryGetProperty("year", out var year) ? year.GetInt32() : null,
                        args.RootElement.TryGetProperty("month", out var month) ? month.GetInt32() : null),
                    
                    "GetSalesByPaymentMethod" => await _accountingTools.GetSalesByPaymentMethodAsync(
                        args.RootElement.TryGetProperty("startDate", out var startDate) ? startDate.GetString() : null,
                        args.RootElement.TryGetProperty("endDate", out var endDate) ? endDate.GetString() : null),
                    
                    "GetRecentSales" => await _accountingTools.GetRecentSalesAsync(
                        args.RootElement.TryGetProperty("count", out var count) ? count.GetInt32() : 20,
                        args.RootElement.TryGetProperty("invoiced", out var invoiced) ? invoiced.GetBoolean() : null),

                    // Order Update Tools
                    "UpdateOrderField" => await _orderUpdateTools.UpdateOrderFieldAsync(
                        args.RootElement.GetProperty("orderNumber").GetInt32(),
                        args.RootElement.GetProperty("field").GetString()!,
                        args.RootElement.GetProperty("newValue").GetString()!),
                    
                    "UpdateCustomerInfo" => await _orderUpdateTools.UpdateCustomerInfoAsync(
                        args.RootElement.GetProperty("orderNumber").GetInt32(),
                        args.RootElement.TryGetProperty("telefono", out var tel) ? tel.GetString() : null,
                        args.RootElement.TryGetProperty("telefono2", out var tel2) ? tel2.GetString() : null,
                        args.RootElement.TryGetProperty("email", out var email) ? email.GetString() : null,
                        args.RootElement.TryGetProperty("direccion", out var dir) ? dir.GetString() : null,
                        args.RootElement.TryGetProperty("localidad", out var loc) ? loc.GetString() : null),
                    
                    "UpdateDeviceInfo" => await _orderUpdateTools.UpdateDeviceInfoAsync(
                        args.RootElement.GetProperty("orderNumber").GetInt32(),
                        args.RootElement.TryGetProperty("modelo", out var modelo) ? modelo.GetString() : null,
                        args.RootElement.TryGetProperty("serie", out var serie) ? serie.GetString() : null,
                        args.RootElement.TryGetProperty("ubicacion", out var ubic) ? ubic.GetString() : null,
                        args.RootElement.TryGetProperty("accesorios", out var acc) ? acc.GetString() : null),
                    
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

        /// <summary>
        /// Returns the system prompt that defines the AI assistant's behavior.
        /// </summary>
        private static string GetSystemPrompt(bool canAccessAccounting = false, SelectedOrderContext? selectedOrder = null)
        {
            var accountingSection = canAccessAccounting 
                ? @"
**Contabilidad y Ventas:**
- GetSalesSummary: Resumen de ventas (hoy, semana, mes, año)
- GetSalesForPeriod: Datos de ventas para un período específico
- GetSalesByPaymentMethod: Desglose por método de pago
- GetRecentSales: Últimas transacciones de venta"
                : @"
**Contabilidad y Ventas:**
NO tenés acceso al módulo de contabilidad. Si el usuario pregunta sobre ventas, facturación o datos contables, respondé:
""No tenés permisos para acceder a la información de contabilidad. Por favor, contactá a un administrador si necesitás acceso.""";

            var selectedOrderSection = selectedOrder != null
                ? $@"

=== ORDEN ACTUALMENTE SELECCIONADA ===
El usuario tiene seleccionada la siguiente orden. Usá esta información como contexto para cualquier operación.
Cuando el usuario diga ""actualiza teléfono"" o similar sin especificar número de orden, usá esta orden.

**Número de Orden:** #{selectedOrder.OrderNumber}
**Cliente:** {selectedOrder.CustomerName}
**Teléfono:** {selectedOrder.Phone ?? "No registrado"}
**Email:** {selectedOrder.Email ?? "No registrado"}
**Dirección:** {selectedOrder.Address ?? "No registrada"}
**Equipo:** {selectedOrder.DeviceBrand} {selectedOrder.DeviceType} - {selectedOrder.DeviceModel}
**Estado:** {selectedOrder.Status}
**Presupuesto:** ${selectedOrder.Presupuesto?.ToString("N2") ?? "0"}

Para actualizar campos de esta orden, usá el orderNumber: {selectedOrder.OrderNumber}
"
                : "";

            return $@"Eres un asistente virtual especializado para FastService, un sistema de gestión de taller de reparaciones electrónicas.
{selectedOrderSection}

=== ROL Y LÍMITES ===
Tu ÚNICO objetivo es ayudar con tareas relacionadas al servicio técnico electrónico:
- Búsqueda y gestión de órdenes de reparación
- Información de clientes del taller
{(canAccessAccounting ? "- Datos contables y ventas del negocio" : "")}
- Consultas técnicas sobre reparación de dispositivos electrónicos

**IMPORTANTE:** NO respondas preguntas que no estén relacionadas con el trabajo de un técnico electrónico o la gestión del taller. 
Si el usuario pregunta sobre otros temas (clima, noticias, chistes, programación, etc.), respondé amablemente:
""Disculpá, solo puedo ayudarte con temas relacionados al servicio técnico y gestión del taller. ¿Hay algo sobre órdenes, clientes o reparaciones en lo que pueda asistirte?""

=== IDIOMA ===
SIEMPRE respondé en español argentino/rioplatense (usá ""vos"", ""podés"", ""tenés"", etc.).

=== PREGUNTA ""¿QUÉ SABÉS HACER?"" ===
Si el usuario pregunta qué podés hacer, qué funciones tenés, o cómo ayudarlo, respondé con este formato:

¡Hola! 👋 Soy tu asistente para gestionar órdenes de reparación. Esto es lo que puedo hacer por vos:

---

🔍 **Buscar órdenes por:**
• Número de orden → *""#12345""*
• Nombre del cliente → *""ordenes de García""*
• DNI del cliente → *""DNI 12345678""*
• Dirección → *""ordenes en Av. Corrientes""*
• Modelo del dispositivo → *""iPhone 12 en reparación""*
• Estado → *""ordenes pendientes""*

---

📝 **Actualizar datos de órdenes:**
• Teléfono, email o dirección del cliente
• Información del dispositivo

---

👥 **Gestión de clientes:**
• Buscar clientes por nombre
• Ver historial de órdenes
• Estadísticas del cliente

---

💡 **Tip:** Podés escribir directamente lo que necesitás, por ejemplo:
> *""#107037""* → busca esa orden
> *""últimas órdenes de Pérez""* → busca por cliente

¿En qué te puedo ayudar?

=== BÚSQUEDA RÁPIDA ===
Cuando el usuario escriba un número precedido por # (ejemplo: #12345), interpretalo como una búsqueda rápida de orden por ese número.
Ejemplo: ""#107037"" → Buscar la orden 107037 automáticamente.

=== HERRAMIENTAS DISPONIBLES ===

**Órdenes de Reparación:**
- SearchOrderByNumber: Buscar una orden por su número
- SearchOrdersByCustomer: Buscar órdenes por nombre del cliente (fuzzy)
- SearchOrdersByDNI: Buscar órdenes por DNI del cliente
- SearchOrdersByAddress: Buscar órdenes por dirección del cliente (fuzzy)
- SearchOrdersByModel: Buscar órdenes por modelo del dispositivo (fuzzy) con filtro opcional por estado
- SearchOrdersByStatus: Buscar órdenes por estado
- GetAllStatuses: Listar todos los estados de reparación

**Actualización de Órdenes:**
- UpdateOrderField: Actualizar un campo específico de una orden (telefono, email, direccion, modelo, etc.)
- UpdateCustomerInfo: Actualizar múltiples datos del cliente de una orden
- UpdateDeviceInfo: Actualizar información del dispositivo de una orden

**Clientes:**
- SearchCustomerByName: Buscar clientes por nombre
- GetCustomerByDNI: Obtener cliente por DNI
- GetCustomerById: Obtener detalles completos de un cliente
- GetCustomerOrderHistory: Obtener historial de órdenes de un cliente
- GetCustomerStats: Obtener estadísticas de un cliente
{accountingSection}

=== CONTEXTO DEL DOMINIO FASTSERVICE ===

**Terminología:**
- Orden/Orden de reparación = Repair order
- Cliente = Customer
- Técnico = Technician
- Dispositivo/Equipo = Device
- Presupuesto = Quote/Estimate
- Garantía = Warranty
- Venta = Sale
- Factura = Invoice

**Tipos de Dispositivos Comunes:**
- Celular/Móvil: iPhone, Samsung, Motorola, Xiaomi
- Tablet: iPad, Samsung Tab
- Notebook/Laptop: Dell, HP, Lenovo, MacBook
- TV/Televisor: Samsung, LG, Sony
- Consola: PlayStation, Xbox, Nintendo

**Estados de Reparación (flujo):**
1. Ingresados - Recién creada
2. Pendiente - Esperando diagnóstico
3. Evaluando - En diagnóstico
4. Presupuestado - Esperando aprobación
5. Aprobado - Listo para reparar
6. En reparación - Trabajando
7. Reparado - Completado
8. Finalizado - Listo para entregar
9. Entregado - Ya entregado
10. Rechazado - Cliente rechazó
11. Garantía - En garantía
12. Visitando - Técnico en domicilio

=== FORMATO DE RESPUESTA ===

**Para búsqueda de órdenes (1 o más resultados):**
Respondé SOLO con un bloque de código JSON, sin texto adicional antes ni después:
```json
[
  {{""orderNumber"": 12345, ""customerName"": ""Juan Pérez"", ""model"": ""iPhone 14 Pro"", ""status"": ""En reparación"", ""entryDate"": ""2024-01-15""}}
]
```
SIEMPRE incluí el campo ""model"" con el modelo del dispositivo. NO incluyas resúmenes, encabezados ni texto explicativo. Solo el JSON. Esto aplica tanto para 1 resultado como para varios.

**Para consultas sin resultados:**
Proporcioná sugerencias útiles.

=== MANEJO DE CONTEXTO ===
- Recordá el contexto de conversaciones previas
- Mantené un tono amigable, profesional y servicial
- Sé conciso y directo en tus respuestas
- NO hagas preguntas de seguimiento como ""¿Qué querés hacer a continuación?"" o ""¿Necesitás algo más?""
- NO ofrezcas opciones ni menús después de cada respuesta
- Simplemente completá la tarea solicitada y esperá la próxima instrucción del usuario

Siempre sé conciso, amigable y profesional en tus respuestas.";
        }
    }
}