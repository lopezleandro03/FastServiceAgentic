# FastService Agentic - Conversational Order Search

Sistema de búsqueda conversacional de órdenes de reparación con IA, construido con Azure OpenAI y MCP Server.

## 🌟 Características

- **Búsqueda Conversacional en Español**: Interactúa con un asistente de IA en lenguaje natural
- **Arquitectura MCP Server**: Reutilizable para múltiples interfaces agentic
- **Múltiples Criterios de Búsqueda**: Por número, cliente, DNI, estado, marca, tipo de dispositivo
- **Vista de Detalles Integrada**: Visualiza información completa de órdenes sin modales
- **Contexto de Conversación**: Mantiene historial para preguntas de seguimiento
- **UI Bilingüe**: Interfaz completamente en español con comprensión de inglés

## 📋 Prerequisitos

### Backend
- .NET 8.0 SDK
- Azure OpenAI API key y endpoint
- SQL Server (Azure SQL o local)
- Conexión a base de datos FastService existente

### Frontend
- Node.js 18+ y npm
- Navegador moderno (Chrome, Edge, Firefox)

## 🚀 Configuración Inicial

### 1. Configurar Backend

```powershell
cd backend/FastService.McpServer
```

Crear `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "FastServiceDb": "Server=tu-servidor.database.windows.net;Database=FastServiceAgenticdb;User Id=tu-usuario;Password=tu-password;TrustServerCertificate=True;"
  },
  "AzureOpenAI": {
    "Endpoint": "https://tu-recurso.cognitiveservices.azure.com/",
    "ApiKey": "tu-api-key",
    "DeploymentName": "gpt-5-nano"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

Restaurar paquetes y ejecutar:

```powershell
dotnet restore
dotnet build
dotnet run
```

El backend estará disponible en `http://localhost:5207`

### 2. Configurar Frontend

```powershell
cd frontend
```

Instalar dependencias:

```powershell
npm install
```

Ejecutar en modo desarrollo:

```powershell
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## 🎯 Uso

### Ejemplos de Consultas

**Búsqueda por número de orden:**
```
Buscá la orden 127937
Mostrame la orden número 12345
```

**Búsqueda por cliente:**
```
Órdenes de Juan Pérez
Buscá reparaciones de Martinez
```

**Búsqueda por estado:**
```
¿Qué órdenes están pendientes?
Mostrame las reparaciones en progreso
¿Cuáles están finalizadas?
```

**Búsqueda por dispositivo:**
```
Buscá órdenes de Samsung
Mostrame reparaciones de TV LED
Órdenes de iPhone
```

**Búsqueda por DNI:**
```
Buscá órdenes del DNI 12345678
```

**Consultas de información:**
```
¿Cuáles son los estados disponibles?
```

### Navegación

1. **Panel de Chat (30%)**: Escribe tu consulta en español
2. **Panel Principal (70%)**: 
   - Vista de bienvenida (por defecto)
   - Lista de resultados (múltiples órdenes)
   - Detalles de orden (orden específica o click en lista)
3. **Botón "Back"**: Regresa de detalles a la lista o inicio

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────────┐              ┌─────────────────┐  │
│  │  ChatPanel   │              │   MainPanel     │  │
│  │  (30% width) │              │   (70% width)   │  │
│  └──────────────┘              └─────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────┐
│           Backend (.NET 8 MCP Server)                │
│  ┌─────────────────────────────────────────────┐   │
│  │          AgentService                       │   │
│  │  (Azure OpenAI + Function Calling)          │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│  ┌─────────────────────────────────────────────┐   │
│  │       OrderSearchTools (6 MCP Tools)        │   │
│  │  - SearchOrdersByNumber                     │   │
│  │  - SearchOrdersByCustomer                   │   │
│  │  - SearchOrdersByStatus                     │   │
│  │  │  - SearchOrdersByDNI                       │   │
│  │  - SearchOrdersByDevice                     │   │
│  │  - GetAllStatuses                           │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│  ┌─────────────────────────────────────────────┐   │
│  │         OrderService (Business Logic)       │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│  ┌─────────────────────────────────────────────┐   │
│  │    Entity Framework Core + FastServiceDb    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   Azure SQL DB   │
              │  (128K+ orders)  │
              └──────────────────┘
```

## 🛠️ Stack Tecnológico

### Backend
- **.NET 8.0**: Framework principal
- **ASP.NET Core Minimal APIs**: Endpoints REST
- **Entity Framework Core 8.0.12**: ORM con SQL Server
- **Azure OpenAI SDK 2.8.0-beta.1**: Integración con GPT-5-nano
- **Model Context Protocol 0.5.0-preview.1**: Arquitectura MCP

### Frontend
- **React 18.3.1**: UI framework
- **TypeScript 5.x**: Type safety
- **TailwindCSS 3.x**: Styling
- **React Scripts**: Build tooling

### Database
- **Azure SQL Server**: Base de datos en la nube
- **128,000+ órdenes de reparación**: Datos históricos 2010-2026

## 📁 Estructura del Proyecto

```
FastServiceAgentic/
├── backend/
│   └── FastService.McpServer/
│       ├── Data/
│       │   ├── Entities/           # Entidades EF scaffolded
│       │   └── FastServiceDbContext.cs
│       ├── Dtos/                   # Data Transfer Objects
│       ├── Services/
│       │   ├── AgentService.cs     # Azure OpenAI orchestration
│       │   └── OrderService.cs     # Business logic
│       ├── Tools/
│       │   └── OrderSearchTools.cs # MCP tools (6 funciones)
│       ├── Program.cs              # API endpoints
│       └── appsettings.json
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ChatPanel/          # Chat UI (30%)
│       │   ├── MainPanel/          # Main content (70%)
│       │   ├── Orders/             # Order components
│       │   └── Layout/             # Split layout
│       ├── hooks/
│       │   └── useChat.ts          # Chat state management
│       ├── types/                  # TypeScript interfaces
│       └── App.tsx
├── Baseline/                       # Legacy FastService code
├── Specs/
│   └── 001-conversational-order-search/
│       ├── spec.md                 # Feature specification
│       ├── plan.md                 # Technical plan
│       └── tasks.md                # Task breakdown
└── README.md
```

## 🔍 Endpoints API

### Backend Endpoints

**Health Check**
```
GET http://localhost:5207/health
Response: {"status":"healthy","timestamp":"..."}
```

**Chat Conversacional**
```
POST http://localhost:5207/api/chat
Body: {
  "message": "Buscá órdenes de Samsung",
  "conversationHistory": [
    {"role": "user", "content": "mensaje anterior"},
    {"role": "assistant", "content": "respuesta anterior"}
  ]
}
Response: {"message": "..."}
```

**Detalles de Orden**
```
GET http://localhost:5207/api/orders/127937
Response: {
  "orderNumber": 127937,
  "customer": {...},
  "device": {...},
  "repair": {...},
  "technician": {...}
}
```

## 🎨 Estados de Reparación

El sistema reconoce 12 estados con su flujo de trabajo:

1. **Ingresados** - Orden recién creada
2. **Pendiente** - Esperando diagnóstico
3. **Evaluando** - En diagnóstico
4. **Presupuestado** - Presupuesto generado
5. **Aprobado** - Cliente aprobó
6. **En reparación** - Técnico trabajando
7. **Reparado** - Reparación completada
8. **Finalizado** - Listo para entregar
9. **Entregado** - Entregado al cliente
10. **Rechazado** - Cliente rechazó
11. **Garantía** - En garantía
12. **Visitando** - Técnico en domicilio

## 🧪 Testing

Para verificar la funcionalidad:

1. **Backend Health**: `curl http://localhost:5207/health`
2. **Chat Básico**: Enviar "Hola" en el chat
3. **Búsqueda Simple**: "Buscá la orden 127937"
4. **Búsqueda Múltiple**: "Órdenes de Martinez"
5. **Contexto**: Después de ver resultados, preguntar "¿Cuál es el estado de la primera?"

## 📝 Notas de Desarrollo

### Contexto de Dominio FastService

El AI asistente tiene conocimiento profundo de:
- Terminología en español e inglés
- Tipos de dispositivos (Celular, TV, Notebook, etc.)
- Marcas comunes (Samsung, iPhone, LG, etc.)
- Flujo de estados de reparación
- Patrones de consulta en español argentino

### Historial de Conversación

- Se envía con cada request para mantener contexto
- Permite preguntas de seguimiento como "¿Y el estado de esa orden?"
- Se mantiene en el estado del frontend (useChat hook)

### Formato de Respuestas AI

**Múltiples órdenes**: JSON + resumen
```json
[
  {
    "orderNumber": 123,
    "customerName": "Juan Pérez",
    "deviceInfo": "Samsung TV",
    "status": "Presupuestado",
    "entryDate": "2026-01-05",
    "estimatedPrice": 5000
  }
]
```

**Orden única**: Texto descriptivo en español

## 🐛 Troubleshooting

**Backend no inicia:**
- Verificar que el puerto 5207 esté disponible
- Revisar connection string en appsettings.json
- Validar Azure OpenAI credentials

**Frontend no compila:**
- Ejecutar `npm install` nuevamente
- Borrar `node_modules` y reinstalar
- Verificar versión de Node.js (18+)

**AI no responde:**
- Verificar logs del backend
- Comprobar Azure OpenAI quota y deployment
- Revisar que el endpoint esté correcto

**No se muestran órdenes:**
- Abrir DevTools > Console para ver logs
- Verificar que el backend devuelva JSON en ```json blocks
- Comprobar CORS en el backend

## 📄 Licencia

Proyecto interno FastService - 2026

## 👥 Contacto

Para soporte o consultas sobre este sistema agentic, contactar al equipo de desarrollo FastService.
