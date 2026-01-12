# MCP Tools Contract: Accounting Tools

**Feature**: 006-mcp-ai-tools  
**Category**: Accounting & Sales  
**Date**: January 9, 2026

## Tool Definitions

### GetSalesSummary

Get sales totals for standard periods.

```json
{
  "name": "GetSalesSummary",
  "description": "Get sales summary for today, this week, this month, and this year. Separates invoiced vs non-invoiced sales.",
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
  "message": "Sales summary retrieved",
  "data": {
    "today": {
      "totalWithInvoice": 25000.00,
      "totalWithoutInvoice": 8500.00,
      "total": 33500.00
    },
    "week": {
      "totalWithInvoice": 150000.00,
      "totalWithoutInvoice": 45000.00,
      "total": 195000.00
    },
    "month": {
      "totalWithInvoice": 580000.00,
      "totalWithoutInvoice": 120000.00,
      "total": 700000.00
    },
    "year": {
      "totalWithInvoice": 2500000.00,
      "totalWithoutInvoice": 750000.00,
      "total": 3250000.00
    }
  }
}
```

---

### GetSalesForPeriod

Get detailed sales breakdown for a specific period.

```json
{
  "name": "GetSalesForPeriod",
  "description": "Get sales data broken down by time intervals within a period. Use 'd' for today (hourly), 'w' for week (daily), 'm' for month (daily), 'y' for year (monthly).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "period": {
        "type": "string",
        "description": "Period type: 'd' (day/hourly), 'w' (week/daily), 'm' (month/daily), 'y' (year/monthly)",
        "enum": ["d", "w", "m", "y"]
      },
      "year": {
        "type": "integer",
        "description": "Year for the query (defaults to current year)"
      },
      "month": {
        "type": "integer",
        "description": "Month for monthly view (1-12, defaults to current month)",
        "minimum": 1,
        "maximum": 12
      }
    },
    "required": ["period"]
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Sales chart data retrieved",
  "data": {
    "period": "m",
    "labels": ["1", "2", "3", "4", "5", "..."],
    "datasets": [
      {
        "label": "Con Factura",
        "data": [12000, 15000, 8000, 22000, 18000]
      },
      {
        "label": "Sin Factura",
        "data": [3000, 5000, 2000, 7000, 4000]
      }
    ]
  }
}
```

---

### GetSalesByPaymentMethod

Get sales grouped by payment method.

```json
{
  "name": "GetSalesByPaymentMethod",
  "description": "Get sales totals grouped by payment method (cash, card, transfer, etc.) for a specified date range.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "startDate": {
        "type": "string",
        "format": "date",
        "description": "Start date for the query (ISO 8601 format, e.g., '2026-01-01')"
      },
      "endDate": {
        "type": "string",
        "format": "date",
        "description": "End date for the query (ISO 8601 format, e.g., '2026-01-31')"
      }
    }
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Sales by payment method retrieved",
  "data": {
    "period": {
      "startDate": "2026-01-01",
      "endDate": "2026-01-31"
    },
    "byPaymentMethod": [
      {
        "method": "Efectivo",
        "total": 350000.00,
        "count": 145,
        "percentage": 50.0
      },
      {
        "method": "Tarjeta de Crédito",
        "total": 250000.00,
        "count": 89,
        "percentage": 35.7
      },
      {
        "method": "Transferencia",
        "total": 100000.00,
        "count": 42,
        "percentage": 14.3
      }
    ],
    "grandTotal": 700000.00,
    "transactionCount": 276
  }
}
```

---

### GetRecentSales

Get list of recent sales with details.

```json
{
  "name": "GetRecentSales",
  "description": "Get a paginated list of recent sales transactions with customer and payment details.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "page": {
        "type": "integer",
        "description": "Page number (1-based)",
        "default": 1,
        "minimum": 1
      },
      "pageSize": {
        "type": "integer",
        "description": "Number of items per page",
        "default": 20,
        "minimum": 1,
        "maximum": 100
      },
      "startDate": {
        "type": "string",
        "format": "date",
        "description": "Filter sales from this date"
      },
      "endDate": {
        "type": "string",
        "format": "date",
        "description": "Filter sales until this date"
      },
      "invoiced": {
        "type": "boolean",
        "description": "Filter by invoiced status (true = only invoiced, false = only non-invoiced, omit = all)"
      }
    }
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Retrieved 20 of 276 sales",
  "data": {
    "items": [
      {
        "ventaId": 5001,
        "origin": "Local Principal",
        "dni": 30456789,
        "clientName": "Juan",
        "clientLastname": "García",
        "amount": 15000.00,
        "description": "Reparación celular Samsung",
        "paymentMethod": "Efectivo",
        "invoiceNumber": "A-0001-00012345",
        "date": "2026-01-09T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalCount": 276,
      "totalPages": 14
    },
    "totals": {
      "totalAmount": 700000.00,
      "totalWithInvoice": 580000.00,
      "totalWithoutInvoice": 120000.00
    }
  }
}
```
