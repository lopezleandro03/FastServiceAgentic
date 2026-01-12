# Feature Specification: MCP AI Tools Server

**Feature Branch**: `006-mcp-ai-tools`  
**Created**: January 9, 2026  
**Status**: Draft  
**Input**: User description: "I would like to move the AI tools to an MCP server and extend the list of tools to the primitives that would allow this AI to answer unexpected user questions about customers, orders or accounting. The intent would be to use this MCP server from other clients, not just this web app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Query Orders from External Client (Priority: P1)

A developer wants to integrate FastService data into a third-party application (e.g., VS Code Copilot, Claude Desktop, or a custom chatbot). They configure their MCP-compatible client to connect to the FastService MCP server and can immediately query order information using natural language or direct tool calls.

**Why this priority**: This is the core value proposition - enabling any MCP-compatible client to access FastService business data. Without this, the feature has no value.

**Independent Test**: Can be fully tested by connecting Claude Desktop or VS Code with an MCP client to the server and successfully querying "Find order 12345" and receiving correct order details.

**Acceptance Scenarios**:

1. **Given** an MCP-compatible client configured with the FastService MCP server endpoint, **When** the client sends a `SearchOrderByNumber` tool call with orderNumber=12345, **Then** the server returns the complete order details in MCP-compliant JSON format.
2. **Given** a connected MCP client, **When** the client requests the list of available tools, **Then** the server returns all available tools with their schemas and descriptions.
3. **Given** a connected MCP client, **When** the client sends a tool call with invalid parameters, **Then** the server returns a properly formatted MCP error response.

---

### User Story 2 - Answer Customer Questions (Priority: P1)

A service representative using any MCP-compatible assistant needs to answer questions about customers, such as "How many orders does customer Juan García have?" or "What is the contact information for customer with DNI 12345678?". The AI can call the appropriate customer tools to retrieve and present this information.

**Why this priority**: Customer queries are fundamental to daily operations and complement order queries for a complete business view.

**Independent Test**: Can be tested by asking "Show me all orders for customer Juan García" and receiving accurate customer and order history information.

**Acceptance Scenarios**:

1. **Given** a customer exists with name "García", **When** the AI calls `SearchCustomerByName` with name="García", **Then** the server returns matching customers with their basic info and order counts.
2. **Given** a customer with DNI "30456789", **When** the AI calls `GetCustomerByDNI` with dni="30456789", **Then** the server returns the customer's full profile including contact details.
3. **Given** a customer ID, **When** the AI calls `GetCustomerOrderHistory` with customerId, **Then** the server returns all orders for that customer sorted by date.

---

### User Story 3 - Answer Accounting Questions (Priority: P2)

A business owner or manager using an MCP-compatible assistant wants to ask questions like "How much did we sell today?" or "What are the sales for this month?". The AI can use accounting tools to retrieve financial summaries and trends.

**Why this priority**: Accounting queries provide business intelligence but are secondary to operational customer/order queries.

**Independent Test**: Can be tested by asking "What were the total sales this week?" and receiving an accurate sales summary.

**Acceptance Scenarios**:

1. **Given** sales data exists for today, **When** the AI calls `GetSalesSummary`, **Then** the server returns sales totals for today, this week, this month, and this year.
2. **Given** the current date is in January 2026, **When** the AI calls `GetSalesForPeriod` with period="month" and month=1, **Then** the server returns daily sales breakdown for January.
3. **Given** multiple payment methods exist, **When** the AI calls `GetSalesByPaymentMethod`, **Then** the server returns sales grouped by payment method (cash, card, etc.).

---

### User Story 4 - Web App Continues to Work (Priority: P1)

The existing FastService web application chat interface continues to function exactly as before. The web app uses the MCP server as its tool backend, and users experience no change in functionality or performance.

**Why this priority**: Backward compatibility is critical - existing users must not be disrupted.

**Independent Test**: Can be tested by using the existing web chat interface to ask "Buscá órdenes de Samsung" and receiving the same response quality and speed as before.

**Acceptance Scenarios**:

1. **Given** the web app chat interface, **When** a user types "Buscá la orden 12345", **Then** the response is returned within the same performance envelope as the current implementation.
2. **Given** the web app chat interface, **When** a user asks any question that worked before, **Then** the functionality and response quality remain identical.

---

### Edge Cases

- What happens when an MCP client requests a tool that doesn't exist?
- How does the system handle concurrent requests from multiple MCP clients?
- What happens when database connectivity is lost mid-request?
- How are partial or malformed tool arguments handled?
- What happens when a search returns thousands of results?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose all AI tools via the MCP (Model Context Protocol) standard interface.
- **FR-002**: System MUST support the following order search tools: SearchOrderByNumber, SearchOrdersByCustomer, SearchOrdersByStatus, SearchOrdersByDNI, SearchOrdersByDevice, GetAllStatuses.
- **FR-003**: System MUST provide new customer tools: SearchCustomerByName, GetCustomerByDNI, GetCustomerById, GetCustomerOrderHistory, GetCustomerStats.
- **FR-004**: System MUST provide accounting tools: GetSalesSummary, GetSalesForPeriod, GetSalesByPaymentMethod, GetRecentSales.
- **FR-005**: System MUST return tool results in MCP-compliant JSON format with consistent success/error structures.
- **FR-006**: System MUST include comprehensive tool descriptions and JSON schemas for all tools to enable AI understanding.
- **FR-007**: System MUST support both direct tool invocation and discovery (list available tools).
- **FR-008**: System MUST maintain the existing web app functionality by integrating with the MCP server.
- **FR-009**: System MUST handle invalid tool calls gracefully with descriptive error messages.
- **FR-010**: System MUST limit result sets to prevent overwhelming responses (default limits on search results).

### Key Entities

- **Order (Reparacion)**: Repair order with customer, device, status, dates, and financial details. Core entity for order-related queries.
- **Customer (Cliente)**: Customer profile with contact information, address, and order history. Links to multiple orders.
- **Sale (Venta)**: Financial transaction record with amount, date, payment method, and optional invoice. Used for accounting queries.
- **Status (EstadoReparacion)**: Repair workflow status. Used for filtering and understanding order lifecycle.
- **Device (TipoDispositivo/Marca)**: Device type and brand information. Used for device-based searches.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any MCP-compatible client can connect and successfully call at least one tool within 5 minutes of configuration.
- **SC-002**: Tool responses return within 2 seconds for single-item lookups and within 5 seconds for search queries.
- **SC-003**: All existing web app chat functionality works identically after migration with no user-reported regressions.
- **SC-004**: At least 3 different MCP clients (e.g., Claude Desktop, VS Code Copilot, custom integration) can successfully use the server.
- **SC-005**: The server handles 10 concurrent client connections without degradation.
- **SC-006**: 100% of tools have complete JSON schema definitions that enable AI clients to correctly infer parameter usage.

## Assumptions

- The MCP (Model Context Protocol) specification is stable and well-documented for implementation.
- MCP-compatible clients (Claude Desktop, VS Code with MCP extensions) are available for testing.
- The existing database schema and services (OrderService, ClientService, AccountingService) provide the necessary data access methods.
- Authentication/authorization for the MCP server will follow the same patterns as the existing API (assumed to be network-level or token-based).
- The existing web app can be modified to consume tools from an MCP server rather than calling them directly.

## Out of Scope

- Real-time notifications or subscriptions (MCP is request-response based).
- Write operations (creating/updating orders, customers, or sales) - this feature focuses on read-only queries.
- User authentication within MCP protocol itself (handled at transport layer).
- Migration of existing chat history or conversation context.
