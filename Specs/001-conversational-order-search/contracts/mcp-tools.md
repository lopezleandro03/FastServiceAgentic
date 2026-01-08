# MCP Tools Contract: FastService Order Search

**Feature**: 001-conversational-order-search  
**Protocol**: Model Context Protocol (MCP)  
**Transport**: HTTP (Streamable HTTP)

## Overview

This document defines the MCP tools exposed by the FastService MCP Server for order search and retrieval operations. These tools are designed to be consumed by AI agents and provide the foundation for conversational order management.

---

## Server Information

```json
{
  "name": "FastServiceMcp",
  "version": "1.0.0",
  "description": "FastService Order Management MCP Server"
}
```

---

## Tools

### 1. search_orders

Search for orders/repairs using multiple criteria.

**Name**: `search_orders`  
**Description**: Search for repair orders by various criteria including order number, customer name, DNI, technician, status, brand, device type, or serial number. Returns up to 50 matching orders.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "orderNumber": {
      "type": "integer",
      "description": "The exact order/repair ID to search for (e.g., 12345)"
    },
    "customerName": {
      "type": "string",
      "description": "Customer name to search for (searches both first and last name, partial match supported)"
    },
    "dni": {
      "type": "integer",
      "description": "Customer's national ID number (DNI)"
    },
    "technicianName": {
      "type": "string",
      "description": "Name of the assigned technician (partial match supported)"
    },
    "status": {
      "type": "string",
      "description": "Order status to filter by (e.g., 'Pendiente', 'En Reparación', 'Entregado')"
    },
    "brand": {
      "type": "string",
      "description": "Device brand/marca to filter by (e.g., 'Samsung', 'LG')"
    },
    "deviceType": {
      "type": "string",
      "description": "Device type to filter by (e.g., 'TV', 'Laptop', 'Microondas')"
    },
    "serialNumber": {
      "type": "string",
      "description": "Device serial number to search for (partial match supported)"
    }
  },
  "required": []
}
```

**Output**: Returns a text summary of matching orders, or a structured result with order summaries.

**Example Invocations**:

1. Search by order number:
   ```json
   { "orderNumber": 12345 }
   ```

2. Search by customer name:
   ```json
   { "customerName": "Lopez" }
   ```

3. Search by multiple criteria:
   ```json
   {
     "technicianName": "Carlos",
     "status": "Pendiente"
   }
   ```

---

### 2. get_order_details

Get full details for a specific order.

**Name**: `get_order_details`  
**Description**: Retrieve complete details for a specific repair order including customer information, device details, repair status, pricing, and assigned personnel.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "orderNumber": {
      "type": "integer",
      "description": "The order/repair ID to retrieve details for"
    }
  },
  "required": ["orderNumber"]
}
```

**Output**: Returns comprehensive order information formatted for human readability.

**Example Invocation**:
```json
{ "orderNumber": 12345 }
```

**Example Output**:
```
Order #12345 Details:
━━━━━━━━━━━━━━━━━━━━

Status: En Reparación (In Progress)
Created: 2026-01-05 10:30:00
Last Updated: 2026-01-07 14:22:00

Customer:
  Name: Juan Lopez
  DNI: 36285548
  Phone: 1143232000
  Email: juan.lopez@email.com
  Address: Calle 1328 Núnero 2801

Device:
  Type: TV
  Brand: Samsung
  Model: UN55AU7000
  Serial: SN123456789

Repair Details:
  Warranty: No
  Home Service: No
  Quote: $15,000.00 (quoted on 2026-01-06)
  Description: No enciende, revisar fuente de alimentación

Assigned:
  Employee: Admin User
  Technician: Carlos Garcia
```

---

### 3. list_order_statuses

List all available order statuses.

**Name**: `list_order_statuses`  
**Description**: Retrieve all available order statuses in the system. Useful for understanding what status values can be used in searches or for explaining order workflow to users.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {},
  "required": []
}
```

**Output**: Returns a list of all active order statuses with descriptions.

**Example Output**:
```
Available Order Statuses:
━━━━━━━━━━━━━━━━━━━━━━━

1. Recibido - Order has been received and logged
2. En Diagnóstico - Device is being diagnosed
3. Presupuestado - Quote has been provided to customer
4. En Reparación - Device is actively being repaired
5. Esperando Repuesto - Waiting for parts
6. Reparado - Repair completed, ready for pickup
7. Entregado - Device delivered to customer
8. Cancelado - Order cancelled
```

---

### 4. get_customer_orders

Get all orders for a specific customer.

**Name**: `get_customer_orders`  
**Description**: Retrieve all orders associated with a specific customer ID. Returns order history for the customer.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "customerId": {
      "type": "integer",
      "description": "The customer ID to retrieve orders for"
    }
  },
  "required": ["customerId"]
}
```

**Output**: Returns a summary list of all orders for the customer.

---

## System Prompt Context

The MCP server configures AI agents with the following domain context:

```
You are a helpful assistant for FastService, an electronic repair business (negocio de reparación de electrónicos). 

Your primary task is to help users search for and view repair orders (órdenes de reparación).

Domain terminology:
- Reparación/Order: A repair ticket for a device
- Cliente: Customer who owns the device
- Técnico: Technician assigned to repair the device
- Estado: Status of the repair (e.g., Pendiente, En Reparación, Entregado)
- Marca: Device brand (e.g., Samsung, LG)
- Tipo de Dispositivo: Device type (e.g., TV, Laptop, Microondas)
- DNI: Customer's national ID number

You understand both Spanish and English queries. When users ask about orders, use the search_orders tool. When they want details about a specific order, use get_order_details.

Always be helpful and suggest alternative search approaches if no results are found.
```

---

## Error Handling

All tools return structured error messages in case of failures:

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "Error: No order found with number 99999. Please verify the order number and try again."
    }
  ]
}
```

Common error scenarios:
- Order not found
- Customer not found
- No search criteria provided
- Database connection error
- Invalid parameter format

---

## Transport Configuration

The MCP server is accessible via HTTP transport:

- **Endpoint**: `https://localhost:7001/mcp` (development)
- **Production**: `https://fastservice-api.azurewebsites.net/mcp`
- **Protocol Version**: `2024-11-05`
- **Session Management**: Stateless with optional session ID header

---

## Client Integration Example

```typescript
// Using MCP Client from frontend
import { McpClient, HttpClientTransport } from '@modelcontextprotocol/sdk';

const client = await McpClient.create(
  new HttpClientTransport({
    endpoint: new URL('https://localhost:7001/mcp')
  })
);

// List available tools
const tools = await client.listTools();

// Call the search_orders tool
const result = await client.callTool({
  name: 'search_orders',
  arguments: { customerName: 'Lopez' }
});
```
