# MCP Tools Contract: Order Tools

**Feature**: 006-mcp-ai-tools  
**Category**: Order Management  
**Date**: January 9, 2026

## Tool Definitions

### SearchOrderByNumber

Retrieve complete details for a specific repair order.

```json
{
  "name": "SearchOrderByNumber",
  "description": "Search for a repair order by its order number. Returns complete details including customer, device, repair status, and dates.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "orderNumber": {
        "type": "integer",
        "description": "The repair order number to search for"
      }
    },
    "required": ["orderNumber"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Order found successfully",
  "data": {
    "orderNumber": 12345,
    "status": "En reparación",
    "customer": {
      "clienteId": 100,
      "nombre": "Juan",
      "apellido": "García",
      "dni": 30456789
    },
    "device": {
      "brand": "Samsung",
      "type": "Celular",
      "model": "Galaxy S21"
    },
    "dates": {
      "createdAt": "2026-01-05T10:30:00Z",
      "deliveredAt": null
    },
    "price": 15000.00,
    "isWarranty": false
  }
}
```

---

### SearchOrdersByCustomer

Find repair orders by customer name with fuzzy matching.

```json
{
  "name": "SearchOrdersByCustomer",
  "description": "Search for repair orders by customer name. Supports partial name matching (fuzzy search).",
  "inputSchema": {
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
}
```

---

### SearchOrdersByStatus

Filter repair orders by workflow status.

```json
{
  "name": "SearchOrdersByStatus",
  "description": "Search for repair orders by repair status (e.g., 'Pendiente', 'En reparación', 'Finalizado').",
  "inputSchema": {
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
}
```

---

### SearchOrdersByDNI

Find orders by customer's national ID number.

```json
{
  "name": "SearchOrdersByDNI",
  "description": "Search for repair orders by customer DNI (national ID number).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "dni": {
        "type": "string",
        "description": "The customer DNI to search for"
      }
    },
    "required": ["dni"]
  }
}
```

---

### SearchOrdersByDevice

Filter orders by device brand and/or type.

```json
{
  "name": "SearchOrdersByDevice",
  "description": "Search for repair orders by device brand and/or device type.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "brand": {
        "type": "string",
        "description": "The device brand (e.g., 'Samsung', 'Apple', 'Motorola')"
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
}
```

---

### GetAllStatuses

List all available repair statuses.

```json
{
  "name": "GetAllStatuses",
  "description": "Get all available repair statuses in the system.",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Retrieved 8 status(es)",
  "count": 8,
  "data": [
    { "id": 1, "name": "Ingresado" },
    { "id": 2, "name": "Pendiente" },
    { "id": 3, "name": "En reparación" },
    { "id": 4, "name": "Finalizado" },
    { "id": 5, "name": "Entregado" }
  ]
}
```
