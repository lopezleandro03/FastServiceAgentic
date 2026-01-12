# Implementation Plan: WhatsApp Order Integration

**Branch**: `007-whatsapp-order-integration` | **Date**: January 10, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-whatsapp-order-integration/spec.md`

## Summary

Integrate WhatsApp Business messaging with FastService orders to enable:
1. Storing WhatsApp conversations linked to orders via customer phone numbers
2. AI-generated conversation summaries stored as "novedades"
3. Opening WhatsApp Web for live conversations
4. Browsing stored message history within FastService

**Technical Approach**: Use Azure Communication Services Advanced Messaging SDK for WhatsApp (already integrated with Azure ecosystem) rather than direct Meta Cloud API. Messages arrive via Event Grid webhooks and are stored locally. Summaries generated using existing Azure OpenAI integration.

## Technical Context

**Language/Version**: C# / .NET 8.0 (existing backend), TypeScript/React (existing frontend)
**Primary Dependencies**: 
- Azure.Communication.Messages (new - WhatsApp messaging)
- Azure.Messaging.EventGrid (new - webhook handling)
- Existing: Entity Framework Core, Azure.AI.OpenAI
**Storage**: Azure SQL Server (existing database, new tables required)
**Testing**: xUnit (backend), Jest (frontend)
**Target Platform**: Azure App Service (existing deployment)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: 
- Message sync < 10 seconds for 100 messages
- Summary generation < 2 seconds
- Webhook processing < 500ms
**Constraints**: 
- Database schema changes require migration scripts
- WhatsApp 24-hour messaging window limitation
- Must respect existing Novedad/TipoNovedad structure
**Scale/Scope**: ~10 concurrent users, ~1000 orders with WhatsApp history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Database Schema Preservation | ⚠️ REQUIRES JUSTIFICATION | Need new tables for WhatsApp messages - see Complexity Tracking |
| II. Modern Frontend-Backend Separation | ✅ PASS | API-first design, React frontend |
| III. Agentic AI Integration | ✅ PASS | AI summaries via existing Azure OpenAI |
| IV. Feature Parity First | ✅ PASS | New feature, not blocking existing functionality |
| V. Observability & Traceability | ✅ PASS | Structured logging, correlation IDs |

## Complexity Tracking

> **Schema Changes Justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `WhatsAppMessage` table | WhatsApp API doesn't support pulling historical messages - must store webhooks | No alternative - webhook storage is the only way to have message history |
| New `WhatsAppSyncLog` table | Track sync operations per customer for incremental sync | Could use Novedad but doesn't fit semantic purpose |
| New `TipoNovedad` entry | "WhatsApp Resumen" category for AI summaries | Existing types don't match this use case |

**Migration Strategy**: Add tables only (no modifications to existing schema), backward compatible, zero downtime deployment.

## Project Structure

### Documentation (this feature)

```text
specs/007-whatsapp-order-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output - API decisions, SDK patterns
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - developer setup guide
├── contracts/           # Phase 1 output - API specifications
│   └── whatsapp-api.yaml
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/FastService.McpServer/
├── Services/
│   ├── WhatsAppService.cs           # NEW - WhatsApp messaging operations
│   └── WhatsAppSummaryService.cs    # NEW - AI summary generation
├── Tools/
│   └── WhatsAppTools.cs             # NEW - MCP tools for AI agent
├── Controllers/
│   └── WebhookController.cs         # NEW - Event Grid webhook handler
├── Data/
│   ├── Entities/
│   │   ├── WhatsAppMessage.cs       # NEW - Message entity
│   │   └── WhatsAppSyncLog.cs       # NEW - Sync tracking entity
│   └── Migrations/
│       └── AddWhatsAppTables.sql    # NEW - Schema migration
├── Dtos/
│   ├── WhatsAppMessageDto.cs        # NEW
│   └── WhatsAppSyncResultDto.cs     # NEW
└── appsettings.json                 # MODIFY - Add ACS connection string

frontend/src/
├── components/
│   ├── WhatsApp/
│   │   ├── WhatsAppPanel.tsx        # NEW - Message history panel
│   │   ├── MessageBubble.tsx        # NEW - Individual message display
│   │   └── SyncButton.tsx           # NEW - Trigger sync action
│   └── MainPanel/
│       └── OrderDetails.tsx         # MODIFY - Add WhatsApp section
├── services/
│   └── whatsappService.ts           # NEW - API client
├── hooks/
│   └── useWhatsAppMessages.ts       # NEW - State management
└── types/
    └── whatsapp.ts                  # NEW - TypeScript types
```

**Structure Decision**: Extends existing web application structure with new WhatsApp-specific modules. Follows established patterns from spec 001.

---

## Phase 0: Research

### Research Tasks

1. **Azure Communication Services WhatsApp Setup**
   - Decision: Use ACS Advanced Messaging over direct Meta Cloud API
   - Rationale: Already in Azure ecosystem, managed webhooks via Event Grid, simpler auth
   - Alternatives: Direct Meta Cloud API (rejected - requires separate Meta app setup, manual webhook management)

2. **Webhook Architecture for Message Receiving**
   - Decision: Event Grid subscription with HTTP webhook endpoint
   - Rationale: ACS publishes `Microsoft.Communication.AdvancedMessageReceived` events
   - Pattern: Idempotent handler with message deduplication by WhatsApp message ID

3. **Phone Number Normalization**
   - Decision: E.164 format (+{country}{number}) stored and queried
   - Pattern: Normalize on ingest, store canonical format, fuzzy match on lookup

4. **AI Summary Generation**
   - Decision: Use existing Azure OpenAI integration with conversation-specific prompt
   - Pattern: Batch recent messages, generate summary, store as Novedad

5. **WhatsApp Web Deep Links**
   - Decision: Use `https://wa.me/{phone}` format (works cross-platform)
   - Alternative: `whatsapp://send?phone={phone}` (rejected - not universally supported)

### Output: [research.md](research.md)

---

## Phase 1: Design & Contracts

### Data Model

#### WhatsAppMessage (New Table)

| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment ID |
| WhatsAppMessageId | nvarchar(100) | Unique WhatsApp message ID (for deduplication) |
| ReparacionId | int (FK) | Linked order (nullable - linked after sync) |
| ClienteId | int (FK) | Customer who sent/received message |
| PhoneNumber | nvarchar(20) | Normalized E.164 phone number |
| Direction | nvarchar(10) | 'inbound' or 'outbound' |
| Content | nvarchar(max) | Message text content |
| MessageType | nvarchar(50) | text, image, document, audio, video, reaction |
| MediaMimeType | nvarchar(100) | MIME type if media message |
| MediaFileName | nvarchar(255) | Original filename if media |
| WhatsAppTimestamp | datetime2 | When message was sent/received in WhatsApp |
| ReceivedAt | datetime2 | When webhook was processed |
| CreatedAt | datetime2 | Record creation timestamp |

**Index**: IX_WhatsAppMessage_PhoneNumber_WhatsAppTimestamp

#### WhatsAppSyncLog (New Table)

| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment ID |
| ClienteId | int (FK) | Customer synced |
| PhoneNumber | nvarchar(20) | Phone number synced |
| LastSyncAt | datetime2 | When last sync completed |
| MessageCount | int | Messages received in last sync |
| Status | nvarchar(20) | success, failed, no_messages |
| ErrorMessage | nvarchar(500) | Error details if failed |

#### TipoNovedad (New Entry)

| TipoNovedadId | Nombre | Descripcion |
|---------------|--------|-------------|
| (auto) | WhatsApp Resumen | Resumen de conversación de WhatsApp generado por IA |

### API Contracts

#### POST /api/whatsapp/sync

Trigger message sync for an order's customer.

```yaml
parameters:
  - name: orderId
    in: query
    required: true
    schema:
      type: integer
responses:
  200:
    description: Sync completed
    content:
      application/json:
        schema:
          type: object
          properties:
            messagesReceived: integer
            lastSyncAt: string (datetime)
            summaryGenerated: boolean
```

#### GET /api/whatsapp/messages/{orderId}

Retrieve stored messages for an order.

```yaml
parameters:
  - name: orderId
    in: path
    required: true
    schema:
      type: integer
  - name: limit
    in: query
    schema:
      type: integer
      default: 50
responses:
  200:
    description: Message list
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: '#/components/schemas/WhatsAppMessageDto'
```

#### POST /api/whatsapp/webhook

Event Grid webhook endpoint (internal).

```yaml
requestBody:
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/EventGridEvent'
responses:
  200:
    description: Event processed
```

### MCP Tools

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_whatsapp_messages` | Get stored WhatsApp messages for a customer | phoneNumber, limit |
| `sync_whatsapp_messages` | Trigger sync for an order | orderId |
| `get_whatsapp_summary` | Get AI summary of recent conversation | orderId |

### Output Files
- [data-model.md](data-model.md)
- [contracts/whatsapp-api.yaml](contracts/whatsapp-api.yaml)
- [quickstart.md](quickstart.md)

---

## Phase 2: Tasks (via /speckit.tasks)

Task breakdown will be generated after plan approval. Key phases:

1. **Infrastructure** (~4h)
   - Database migrations
   - ACS configuration
   - Event Grid subscription

2. **Backend Services** (~6h)
   - WhatsAppService implementation
   - Webhook controller
   - Summary generation
   - MCP tools

3. **Frontend Components** (~4h)
   - WhatsApp panel
   - Message display
   - Sync button
   - Integration with OrderDetails

4. **Integration & Testing** (~2h)
   - End-to-end flow testing
   - Error handling validation

**Estimated Total**: ~16 hours

---

## Dependencies

### External Dependencies

| Dependency | Purpose | Required Setup |
|------------|---------|----------------|
| Azure Communication Services | WhatsApp messaging | Create ACS resource, register WhatsApp channel |
| Azure Event Grid | Webhook delivery | Create subscription for ACS events |
| WhatsApp Business Account | Business verification | Meta Business verification required |

### Internal Dependencies

| Depends On | Reason |
|------------|--------|
| Spec 001 (Conversational Search) | Uses existing AgentService, Azure OpenAI config |
| Spec 004 (Order Details) | Extends OrderDetails component with WhatsApp section |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| WhatsApp Business verification delay | Cannot test with real messages | Use ACS test sandbox during development |
| 24-hour messaging window | Cannot send proactive messages | Document limitation, use template messages |
| Message volume at scale | Performance degradation | Pagination, background sync jobs |
| Phone number format inconsistency | Failed customer matching | Robust normalization, fuzzy matching |
