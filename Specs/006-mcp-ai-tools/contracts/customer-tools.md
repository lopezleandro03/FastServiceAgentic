# MCP Tools Contract: Customer Tools

**Feature**: 006-mcp-ai-tools  
**Category**: Customer Management  
**Date**: January 9, 2026

## Tool Definitions

### SearchCustomerByName

Find customers by name with fuzzy matching.

```json
{
  "name": "SearchCustomerByName",
  "description": "Search for customers by name. Supports partial matching on first name (Nombre) and last name (Apellido).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The customer name to search for (matches first or last name)"
      },
      "maxResults": {
        "type": "integer",
        "description": "Maximum number of results to return",
        "default": 10
      }
    },
    "required": ["name"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Found 3 customer(s) matching 'García'",
  "count": 3,
  "data": [
    {
      "clienteId": 100,
      "dni": 30456789,
      "nombre": "Juan",
      "apellido": "García",
      "email": "juan.garcia@email.com",
      "telefono": "11-4567-8901",
      "orderCount": 5,
      "lastOrderDate": "2026-01-05T10:30:00Z"
    }
  ]
}
```

---

### GetCustomerByDNI

Retrieve customer by national ID number.

```json
{
  "name": "GetCustomerByDNI",
  "description": "Get a customer's full profile by their DNI (national ID number).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "dni": {
        "type": "string",
        "description": "The customer DNI to look up"
      }
    },
    "required": ["dni"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Customer found",
  "data": {
    "clienteId": 100,
    "dni": 30456789,
    "nombre": "Juan",
    "apellido": "García",
    "email": "juan.garcia@email.com",
    "telefono": "11-4567-8901",
    "celular": "11-2345-6789",
    "direccion": "Av. Corrientes 1234",
    "localidad": "CABA",
    "addressDetails": {
      "calle": "Av. Corrientes",
      "altura": "1234",
      "ciudad": "Buenos Aires",
      "provincia": "CABA",
      "pais": "Argentina"
    }
  }
}
```

---

### GetCustomerById

Retrieve full customer details including order history.

```json
{
  "name": "GetCustomerById",
  "description": "Get complete customer details including address and all orders.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "customerId": {
        "type": "integer",
        "description": "The customer ID (ClienteId)"
      }
    },
    "required": ["customerId"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Customer details retrieved",
  "data": {
    "clienteId": 100,
    "dni": 30456789,
    "nombre": "Juan",
    "apellido": "García",
    "email": "juan.garcia@email.com",
    "telefono": "11-4567-8901",
    "celular": "11-2345-6789",
    "direccion": "Av. Corrientes 1234",
    "localidad": "CABA",
    "addressDetails": { ... },
    "orders": [
      {
        "orderNumber": 12345,
        "status": "En reparación",
        "deviceType": "Celular",
        "brand": "Samsung",
        "model": "Galaxy S21",
        "createdAt": "2026-01-05T10:30:00Z",
        "deliveredAt": null,
        "finalPrice": 15000.00,
        "isWarranty": false
      }
    ],
    "stats": {
      "totalOrders": 5,
      "completedOrders": 3,
      "pendingOrders": 2,
      "totalSpent": 45000.00
    }
  }
}
```

---

### GetCustomerOrderHistory

Get all orders for a specific customer.

```json
{
  "name": "GetCustomerOrderHistory",
  "description": "Get all repair orders for a specific customer, sorted by date (newest first).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "customerId": {
        "type": "integer",
        "description": "The customer ID (ClienteId)"
      },
      "maxResults": {
        "type": "integer",
        "description": "Maximum number of orders to return",
        "default": 50
      }
    },
    "required": ["customerId"]
  }
}
```

---

### GetCustomerStats

Get aggregated statistics for a customer.

```json
{
  "name": "GetCustomerStats",
  "description": "Get summary statistics for a customer including order counts and total spending.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "customerId": {
        "type": "integer",
        "description": "The customer ID (ClienteId)"
      }
    },
    "required": ["customerId"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Customer stats retrieved",
  "data": {
    "customerId": 100,
    "customerName": "Juan García",
    "totalOrders": 5,
    "completedOrders": 3,
    "pendingOrders": 2,
    "warrantyOrders": 1,
    "totalSpent": 45000.00,
    "averageOrderValue": 11250.00,
    "firstOrderDate": "2024-03-15T14:20:00Z",
    "lastOrderDate": "2026-01-05T10:30:00Z"
  }
}
```
