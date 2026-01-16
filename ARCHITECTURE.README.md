# FastService Agentic - Architecture Documentation

## 🏗️ System Overview

FastService Agentic is a modern **AI-powered repair shop management system** that combines a React frontend with a .NET 8 backend, integrated with Azure OpenAI for conversational search capabilities.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    USERS                                             │
│                     (Admins, Technicians, Shop Employees)                            │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              React Frontend                                          │
│                           http://localhost:3000                                      │
│                                                                                      │
│    ┌───────────────────────────────────────┐   ┌───────────────────────────────┐    │
│    │           Main Panel (70%)            │   │      Chat AI Panel (30%)      │    │
│    │  ┌─────────┐  ┌─────────┐  ┌───────┐  │   │  ┌─────────────────────────┐  │    │
│    │  │ Kanban  │  │ Orders  │  │Clients│  │   │  │   AI Chat Interface     │  │    │
│    │  │ Board   │  │ Detail  │  │Module │  │   │  │  (Azure OpenAI Agent)   │  │    │
│    │  └─────────┘  └─────────┘  └───────┘  │   │  └─────────────────────────┘  │    │
│    │  ┌─────────┐  ┌─────────┐  ┌───────┐  │   │  ┌─────────────────────────┐  │    │
│    │  │Accounting│ │ Search  │  │WhatsApp│ │   │  │   Action Suggestions    │  │    │
│    │  │Dashboard│  │Advanced │  │Templates│ │   │  │      (Chips UI)        │  │    │
│    │  └─────────┘  └─────────┘  └───────┘  │   │  └─────────────────────────┘  │    │
│    └───────────────────┬───────────────────┘   └──────────────┬────────────────┘    │
│                        │                                      │                      │
└────────────────────────┼──────────────────────────────────────┼──────────────────────┘
                         │                                      │
                         │ HTTP/REST                            │ HTTP/REST
                         │ via /api/*                           │ via /api/chat
                         │                                      │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          FastService.McpServer (.NET 8)                              │
│                              http://localhost:5207                                   │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              API Layer                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │ │
│  │  │   /api/auth  │  │  /api/chat   │  │ /api/orders  │  │    /mcp      │       │ │
│  │  │   Login      │  │  AI Agent    │  │  CRUD/Kanban │  │  MCP Server  │       │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │ │
│  └─────────┼─────────────────┼─────────────────┼─────────────────┼────────────────┘ │
│            │                 │                 │                 │                   │
│            │                 │                 │                 │ ◄── External MCP  │
│            │                 │                 │                 │     Clients       │
│            │                 │                 │                 │  (Claude Desktop, │
│            │                 ▼                 │                 │   VS Code, etc)   │
│            │    ┌────────────────────────┐     │                 │                   │
│            │    │      AgentService      │     │                 │                   │
│            │    │    (Azure OpenAI)      │     │                 │                   │
│            │    │  ┌──────────────────┐  │     │                 │                   │
│            │    │  │ Function Calling │  │     │                 │                   │
│            │    │  │    via Tools     │──┼─────┼─────────────────┘                   │
│            │    │  └──────────────────┘  │     │                                     │
│            │    └───────────┬────────────┘     │                                     │
│            │                │                  │                                     │
│            └────────────────┼──────────────────┘                                     │
│                             │                                                        │
│                             ▼                                                        │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                          MCP Tools Layer                                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐             │  │
│  │  │ OrderSearchTools │  │  CustomerTools   │  │ AccountingTools  │             │  │
│  │  │    (6 tools)     │  │    (5 tools)     │  │    (4 tools)     │             │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘             │  │
│  │                    (Used by AgentService & External MCP Clients)               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                              │                                                       │
│                              ▼                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                            Services Layer                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ OrderService │  │ClientService │  │ Accounting   │  │   Auth       │       │  │
│  │  │ (Business)   │  │  (Clients)   │  │   Service    │  │  Service     │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                              │                                                       │
│                              ▼                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           Data Layer (EF Core)                                 │  │
│  │                        FastServiceDbContext                                    │  │
│  │                          43 Entity Models                                      │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                          ┌───────────────────────┐
                          │   Azure SQL Database  │
                          │    (FastServiceDb)    │
                          └───────────────────────┘
```

---

## 🎨 Frontend Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | - |
| State Management | React Hooks | - |
| HTTP Client | Fetch API | - |

### Component Structure

```
frontend/src/
├── App.tsx                 # Main app with routing and layout
├── index.tsx               # Entry point
│
├── components/
│   ├── Layout/             # Split layout (Main + Chat panels)
│   │   └── SplitLayout.tsx
│   │
│   ├── MainPanel/          # Left side - main content area
│   │   └── MainPanel.tsx   # Switches between views (Kanban, Orders, etc.)
│   │
│   ├── ChatPanel/          # Right side - AI chat interface
│   │   ├── ChatPanel.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ActionSuggestions.tsx    # Action chips for order operations
│   │   └── DefaultSuggestions.tsx   # Initial suggestions when no order selected
│   │
│   ├── Kanban/             # Kanban board for order tracking
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   └── KanbanFilters.tsx
│   │
│   ├── Orders/             # Order management components
│   │   ├── OrderDetailsView.tsx     # Full order details with actions
│   │   ├── OrderCreateView.tsx      # Create/edit order form
│   │   ├── OrderList.tsx
│   │   └── OrderAdvancedSearch.tsx
│   │
│   ├── Accounting/         # Financial dashboard
│   │   └── AccountingDashboard.tsx
│   │
│   ├── Clients/            # Client management
│   │   └── ClientsModule.tsx
│   │
│   ├── WhatsApp/           # WhatsApp template management
│   │   └── WhatsAppTemplatesModule.tsx
│   │
│   ├── Login/              # Authentication
│   │   └── LoginPage.tsx
│   │
│   ├── Print/              # Receipt printing
│   │   └── PrintReceipt.tsx
│   │
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (30+ components)
│
├── hooks/                  # Custom React hooks
│   ├── useChat.ts          # Main chat state management (1600+ lines)
│   ├── useOrderActions.ts  # Order action definitions
│   └── useIsMobile.ts
│
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication state
│
├── services/               # API service layer
│   ├── orderApi.ts
│   ├── accountingApi.ts
│   └── whatsappApi.ts
│
└── types/                  # TypeScript type definitions
    ├── order.ts
    ├── kanban.ts
    ├── auth.ts
    └── chat.ts
```

### Key Frontend Features

#### 1. Split Layout Design
- **Left Panel (70%)**: Main content area with multiple views
  - Kanban Board (default)
  - Order Details
  - Accounting Dashboard
  - Clients Module
  - Advanced Search
  - WhatsApp Templates
- **Right Panel (30%)**: AI Chat interface always visible

#### 2. Kanban Board
7 columns representing repair workflow stages:
1. **INGRESADO** - New orders
2. **A REPARAR** - Ready for repair (includes reentries)
3. **RECHAZADO (cliente)** - Client rejected budget
4. **PRESUPUESTADO** - Budget quoted, awaiting approval
5. **ESP. REPUESTO** - Waiting for parts
6. **REPARADO** - Repair completed
7. **RECHAZADO (técnico)** - Technician rejection

#### 3. Action Chips System
Context-aware action buttons that appear when an order is selected:
- **Common Actions**: Add Note (available to all)
- **Admin Actions**: Inform Budget, Pickup, Deposit, Reentry, Reject Budget
- **Technician Actions**: Budget, Repaired, Reject, Wait for Parts, Home Repair

#### 4. Role-Based Access
| Role | Permissions |
|------|-------------|
| Admin | Full access including accounting |
| Manager | All actions, expandable action groups |
| Technician | Technician-specific actions only |

---

## ⚙️ Backend Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | .NET / ASP.NET Core | 8.0 |
| API Style | Minimal API | - |
| ORM | Entity Framework Core | 8.0.12 |
| Database | SQL Server (Azure SQL) | - |
| AI | Azure OpenAI | 2.8.0-beta.1 |
| MCP Protocol | ModelContextProtocol | 0.5.0-preview.1 |
| API Docs | Swagger/OpenAPI | 6.6.2 |

### Project Structure

```
backend/FastService.McpServer/
├── Program.cs                  # Entry point + Minimal API endpoints
├── appsettings.json            # Configuration
├── appsettings.{Environment}.json
│
├── Controllers/
│   └── AccountingController.cs # Complex accounting endpoints
│
├── Services/
│   ├── AgentService.cs         # Azure OpenAI integration
│   ├── OrderService.cs         # Order business logic (2200+ lines)
│   ├── AccountingService.cs    # Financial operations
│   ├── ClientService.cs        # Client management
│   └── OrderCacheService.cs    # Caching layer
│
├── Tools/                      # MCP Tools (16 total)
│   ├── OrderSearchTools.cs     # 6 order search tools
│   ├── CustomerTools.cs        # 5 customer tools
│   └── AccountingTools.cs      # 4 accounting tools + status tool
│
├── Data/
│   ├── FastServiceDbContext.cs # EF Core DbContext
│   ├── Entities/               # 43 entity models
│   │   ├── Cliente.cs
│   │   ├── Reparacion.cs
│   │   ├── EstadoReparacion.cs
│   │   └── ... (40+ more)
│   └── Migrations/             # SQL migration scripts
│
├── Dtos/                       # Data Transfer Objects (25+)
│   ├── OrderDetails.cs
│   ├── KanbanBoardData.cs
│   ├── SalesSummaryDto.cs
│   └── ...
│
└── Prompts/
    └── SystemPrompt.md         # AI agent system prompt (Spanish)
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User authentication |
| GET | `/api/auth/permissions` | Get user permissions |

#### Chat (AI Agent)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI agent |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/{id}` | Update order |
| GET | `/api/orders/kanban` | Get Kanban board data |
| POST | `/api/orders/{id}/novedades` | Add note/movement |
| POST | `/api/orders/{id}/retira` | Process order pickup |

#### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List clients (paginated) |
| GET | `/api/clients/{id}` | Get client details |
| GET | `/api/clients/search` | Search clients |

#### Accounting
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounting/summary` | Get sales summary |
| GET | `/api/accounting/chart/{period}` | Get chart data |
| GET | `/api/accounting/movements` | Get sales movements |

#### MCP Server
| Method | Endpoint | Description |
|--------|----------|-------------|
| * | `/mcp` | MCP protocol endpoint (SSE) |

---

## 🤖 AI Agent Architecture

### Overview

The AI agent uses **Azure OpenAI** with **function calling** to enable natural language interactions with the database.

```
User: "Buscar órdenes de García"
         │
         ▼
┌─────────────────────────────────────┐
│          AgentService               │
│  ┌─────────────────────────────┐   │
│  │   Azure OpenAI ChatClient   │   │
│  │   (GPT-4 / GPT-4o)          │   │
│  └─────────────┬───────────────┘   │
│                │                    │
│     Intent: Search by customer      │
│     Tool: SearchOrdersByCustomer    │
│                │                    │
│  ┌─────────────▼───────────────┐   │
│  │    OrderSearchTools         │   │
│  │    SearchOrdersByCustomer() │   │
│  └─────────────┬───────────────┘   │
│                │                    │
│  ┌─────────────▼───────────────┐   │
│  │    OrderService             │   │
│  │    Database Query           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         ▼
Response: JSON array of matching orders
```

### MCP Tools (16 Total)

#### Order Tools (6)
| Tool | Description |
|------|-------------|
| `SearchOrderByNumber` | Find order by ID |
| `SearchOrdersByCustomer` | Fuzzy search by customer name |
| `SearchOrdersByDNI` | Search by customer DNI |
| `SearchOrdersByAddress` | Fuzzy search by address |
| `SearchOrdersByModel` | Search by device model |
| `SearchOrdersByStatus` | Search by repair status |

#### Customer Tools (5)
| Tool | Description |
|------|-------------|
| `SearchCustomerByName` | Search customers by name |
| `GetCustomerByDNI` | Get customer by DNI |
| `GetCustomerById` | Get full customer details |
| `GetCustomerOrderHistory` | Get customer's order history |
| `GetCustomerStats` | Get customer statistics |

#### Accounting Tools (4)
| Tool | Description |
|------|-------------|
| `GetSalesSummary` | Get sales totals by period |
| `GetSalesChart` | Get chart data for period |
| `GetSalesByPaymentMethod` | Breakdown by payment type |
| `GetAllStatuses` | List all repair statuses |

### System Prompt

The AI agent is configured with a Spanish (Argentine dialect) system prompt that:
- Defines the assistant's role and capabilities
- Specifies response formats (JSON for orders)
- Lists available tools and their usage
- Provides domain context (repair shop terminology)
- Sets conversation guidelines

---

## 🔐 Authentication & Authorization

### User Roles

| Role | Description |
|------|-------------|
| `FastServiceAdmin` | Full system access |
| `Gerente` | Manager with full operational access |
| `ElectroShopAdmin` | Shop-level admin |
| `Tecnico` | Technician with limited actions |

### Permission System

```typescript
interface UserPermissions {
  canAccessAccounting: boolean;  // Financial data access
  canCreateOrders: boolean;      // Create new orders
  canEditOrders: boolean;        // Edit existing orders
  canDeleteOrders: boolean;      // Delete orders
  canAccessKanban: boolean;      // View Kanban board
  isAdmin: boolean;              // Admin role flag
  isTecnico: boolean;            // Technician role flag
  isManager: boolean;            // Manager role flag
}
```

---

## 📊 Database Schema (Key Entities)

### Core Entities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Cliente      │     │   Reparacion    │     │ EstadoReparacion│
│─────────────────│     │─────────────────│     │─────────────────│
│ ClienteId (PK)  │◄────│ ClienteId (FK)  │     │ EstadoRepId (PK)│
│ Nombre          │     │ ReparacionId    │────►│ Nombre          │
│ Apellido        │     │ EstadoRepId(FK) │     │ DisplayOrder    │
│ DNI             │     │ TecnicoId (FK)  │     └─────────────────┘
│ Telefono1       │     │ Presupuesto     │
│ Email           │     │ CreadoEn        │     ┌─────────────────┐
│ Direccion       │     │ ModificadoEn    │     │    Usuario      │
└─────────────────┘     └─────────────────┘     │─────────────────│
                               │                 │ UsuarioId (PK)  │
                               │                 │ Nombre          │
                               ▼                 │ Rol             │
                        ┌─────────────────┐     │ PasswordHash    │
                        │    Novedades    │     └─────────────────┘
                        │─────────────────│
                        │ NovedadId (PK)  │
                        │ ReparacionId    │
                        │ Tipo            │
                        │ Observacion     │
                        │ Fecha           │
                        └─────────────────┘
```

### Entity Count: 43 entities including
- `Cliente`, `Reparacion`, `ReparacionDetalle`
- `EstadoReparacion`, `Novedades`
- `Usuario`, `Rol`
- `Marca`, `TipoDispositivo`
- `Ventum` (Sales), `DetalleVentum`
- `Comercio` (Business/Shop)
- `WhatsAppTemplate`, `WhatsAppTemplateVariable`

---

## 🚀 Deployment

### Azure Static Web Apps (Frontend)

The frontend is deployed as an Azure Static Web App with configuration in `staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    { "route": "/api/*", "allowedRoles": ["authenticated"] }
  ]
}
```

### Azure App Service (Backend)

The backend runs on Azure App Service with:
- .NET 8 runtime
- Azure SQL Database connection
- Azure OpenAI integration

### Infrastructure as Code

Bicep templates in `/infra/`:
- `main.bicep` - Main infrastructure definition
- `main.bicepparam` - Parameters file

---

## 📁 Project Structure Summary

```
FastServiceAgentic/
├── README.md                    # Quick start guide
├── ARCHITECTURE.README.md       # This file
├── WHATSAPP.MD                  # WhatsApp integration docs
├── FastServiceAgentic.sln       # Solution file
│
├── backend/
│   ├── ARCHITECTURE.md          # Detailed backend architecture
│   ├── AI-ARCHITECTURE.md       # AI agent documentation
│   └── FastService.McpServer/   # Backend project
│
├── frontend/
│   ├── README.md                # Frontend documentation
│   ├── package.json
│   └── src/                     # React source code
│
├── Baseline/                    # Legacy application reference
│   ├── FastService/             # Original MVC application
│   └── Model/                   # Database model
│
├── infra/                       # Infrastructure as Code
│   └── main.bicep
│
└── Specs/                       # Feature specifications
    ├── GOAL.MD
    ├── 001-conversational-order-search/
    ├── 002-shadcn-ui-migration/
    ├── 003-order-kanban-board/
    ├── 004-compact-order-details/
    ├── 005-accounting-module/
    ├── 006-mcp-ai-tools/
    └── 007-whatsapp-order-integration/
```

---

## 🔧 Development

### Running Locally

```powershell
# Backend
cd backend/FastService.McpServer
dotnet run --urls "http://localhost:5207"

# Frontend (separate terminal)
cd frontend
npm start
```

### VS Code Tasks

Pre-configured tasks in `.vscode/tasks.json`:
- **Start Backend Server** - Run .NET backend
- **Start Frontend** - Run React dev server
- **Start Full Stack** - Run both in parallel

### Environment Configuration

Backend (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "FastServiceDb": "your-connection-string"
  },
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com/",
    "ApiKey": "your-api-key",
    "DeploymentName": "gpt-4"
  }
}
```

Frontend (`.env`):
```
REACT_APP_API_URL=http://localhost:5207
```

---

## 📚 Additional Documentation

- [Backend Architecture](backend/ARCHITECTURE.md) - Detailed backend docs
- [AI Architecture](backend/AI-ARCHITECTURE.md) - AI agent implementation
- [WhatsApp Integration](WHATSAPP.MD) - WhatsApp template system
- [Feature Specs](Specs/) - Individual feature specifications
