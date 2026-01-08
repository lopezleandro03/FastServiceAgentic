# Tasks: Conversational Order Search

**Input**: Design documents from `/specs/001-conversational-order-search/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions
- Tests NOT included (not explicitly requested in spec)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project structure for both backend and frontend

- [x] T001 Create backend solution structure at `backend/FastService.McpServer/FastService.McpServer.csproj`
- [x] T002 [P] Create frontend React project at `frontend/` with TypeScript template
- [x] T003 [P] Configure backend `appsettings.json` with connection string and Azure OpenAI settings in `backend/FastService.McpServer/appsettings.json`
- [x] T004 [P] Configure frontend environment variables in `frontend/.env` for MCP endpoint
- [x] T005 [P] Install backend NuGet packages: ModelContextProtocol, EntityFrameworkCore.SqlServer, Azure.AI.OpenAI
- [x] T006 [P] Install frontend npm packages: @modelcontextprotocol/sdk, tailwindcss, axios
- [x] T007 [P] Configure TailwindCSS in `frontend/tailwind.config.js` and `frontend/src/index.css`
- [x] T008 [P] Add `.gitignore` entries for both backend and frontend build artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Entity Framework

- [x] T009 Scaffold EF Core entities from existing database into `backend/FastService.McpServer/Data/Entities/`
- [x] T010 Create `FastServiceDbContext.cs` in `backend/FastService.McpServer/Data/FastServiceDbContext.cs`
- [x] T011 Configure DbContext registration in `backend/FastService.McpServer/Program.cs`

### MCP Server Infrastructure

- [x] T012 Configure MCP server with HTTP transport in `backend/FastService.McpServer/Program.cs`
- [x] T013 [P] Create base MCP tool response helpers in `backend/FastService.McpServer/Tools/ToolHelpers.cs`
- [x] T014 [P] Configure CORS policy for frontend origin in `backend/FastService.McpServer/Program.cs`

### Frontend Infrastructure

- [x] T015 Create TypeScript types for chat messages in `frontend/src/types/chat.ts`
- [x] T016 [P] Create TypeScript types for orders in `frontend/src/types/order.ts`
- [x] T017 [P] Create MCP client wrapper service in `frontend/src/services/mcpClient.ts`

### Shared DTOs

- [x] T018 [P] Create `OrderSearchCriteria.cs` DTO in `backend/FastService.McpServer/Dtos/OrderSearchCriteria.cs`
- [x] T019 [P] Create `OrderSummary.cs` DTO in `backend/FastService.McpServer/Dtos/OrderSummary.cs`
- [x] T020 [P] Create `OrderDetails.cs` DTO in `backend/FastService.McpServer/Dtos/OrderDetails.cs`
- [x] T021 [P] Create `OrderStatus.cs` DTO in `backend/FastService.McpServer/Dtos/OrderStatus.cs`

**Checkpoint**: Foundation ready - MCP server runs, frontend builds, database connected

---

## Phase 3: User Story 1 - Split UI Layout with Chat Panel (Priority: P1) 🎯 MVP

**Goal**: Display a split-screen interface with 70% main content and 30% chat panel

**Independent Test**: Load the application and verify two-panel layout renders correctly with responsive behavior

### Implementation for User Story 1

- [x] T022 [US1] Create `SplitLayout.tsx` component in `frontend/src/components/Layout/SplitLayout.tsx`
- [x] T023 [P] [US1] Create `MainPanel.tsx` placeholder component in `frontend/src/components/MainPanel/MainPanel.tsx`
- [x] T024 [P] [US1] Create `ChatPanel.tsx` container component in `frontend/src/components/ChatPanel/ChatPanel.tsx`
- [x] T025 [US1] Create `MessageInput.tsx` with text field and send button in `frontend/src/components/ChatPanel/MessageInput.tsx`
- [x] T026 [P] [US1] Create `MessageList.tsx` for conversation history in `frontend/src/components/ChatPanel/MessageList.tsx`
- [x] T027 [US1] Integrate SplitLayout into `App.tsx` in `frontend/src/App.tsx`
- [x] T028 [US1] Add responsive styles for split layout in `frontend/src/index.css`

**Checkpoint**: Application shows 70/30 split layout with chat panel scaffold (input area + message history area)

---

## Phase 4: User Story 2 - Basic Chat Interaction with AI Agent (Priority: P2)

**Goal**: Enable users to type messages and receive AI responses

**Independent Test**: Type a greeting and receive a response from the agent

### Backend Implementation for User Story 2

- [ ] T029 [US2] Create `OrderService.cs` with basic query methods in `backend/FastService.McpServer/Services/OrderService.cs`
- [ ] T030 [US2] Create basic `OrderSearchTools.cs` with echo tool for testing in `backend/FastService.McpServer/Tools/OrderSearchTools.cs`
- [ ] T031 [US2] Register OrderSearchTools with MCP server in `backend/FastService.McpServer/Program.cs`
- [ ] T032 [US2] Configure Azure OpenAI client for agent orchestration in `backend/FastService.McpServer/Services/AgentService.cs`

### Frontend Implementation for User Story 2

- [ ] T033 [US2] Create `useChat.ts` hook for chat state management in `frontend/src/hooks/useChat.ts`
- [ ] T034 [US2] Implement message sending in `MessageInput.tsx` in `frontend/src/components/ChatPanel/MessageInput.tsx`
- [ ] T035 [US2] Implement message rendering in `MessageList.tsx` in `frontend/src/components/ChatPanel/MessageList.tsx`
- [ ] T036 [US2] Create `LoadingIndicator.tsx` component in `frontend/src/components/ChatPanel/LoadingIndicator.tsx`
- [ ] T037 [US2] Connect ChatPanel to MCP client and display responses in `frontend/src/components/ChatPanel/ChatPanel.tsx`
- [ ] T038 [US2] Add error handling for AI service failures in `frontend/src/services/mcpClient.ts`

**Checkpoint**: Users can send messages and receive responses; loading indicator shown during processing; errors handled gracefully

---

## Phase 5: User Story 3 - Conversational Order Search (Priority: P3)

**Goal**: Enable natural language order search through the AI assistant

**Independent Test**: Ask "find order 12345" and verify matching order is returned

### Backend Implementation for User Story 3

- [ ] T039 [US3] Implement `search_orders` MCP tool in `backend/FastService.McpServer/Tools/OrderSearchTools.cs`
- [ ] T040 [US3] Add search by order number (ReparacionId) in OrderService
- [ ] T041 [US3] Add search by customer name (Nombre, Apellido) in OrderService
- [ ] T042 [P] [US3] Add search by DNI in OrderService in `backend/FastService.McpServer/Services/OrderService.cs`
- [ ] T043 [P] [US3] Add search by technician name in OrderService
- [ ] T044 [P] [US3] Add search by status in OrderService
- [ ] T045 [P] [US3] Add search by brand and device type in OrderService
- [ ] T046 [P] [US3] Add search by serial number in OrderService
- [ ] T047 [US3] Implement result limiting (max 50) and formatting in OrderSearchTools
- [ ] T048 [US3] Add "no results" handling with suggestions in OrderSearchTools

### Frontend Implementation for User Story 3

- [ ] T049 [US3] Create `SearchResults.tsx` to display order list in chat in `frontend/src/components/ChatPanel/SearchResults.tsx`
- [ ] T050 [US3] Style search results for readability in chat context
- [ ] T051 [US3] Add click handler on search results for order selection

**Checkpoint**: Users can search orders using natural language; results appear in chat with clickable items

---

## Phase 6: User Story 4 - Display Order Details in Main Panel (Priority: P4)

**Goal**: Show full order details in main panel when user selects an order

**Independent Test**: Search for an order, click result, verify details appear in main panel

### Backend Implementation for User Story 4

- [ ] T052 [US4] Implement `get_order_details` MCP tool in `backend/FastService.McpServer/Tools/OrderSearchTools.cs`
- [ ] T053 [US4] Add GetOrderDetails method to OrderService returning full OrderDetails DTO

### Frontend Implementation for User Story 4

- [ ] T054 [US4] Create `useOrder.ts` hook for selected order state in `frontend/src/hooks/useOrder.ts`
- [ ] T055 [US4] Create `OrderDetails.tsx` component in `frontend/src/components/MainPanel/OrderDetails.tsx`
- [ ] T056 [US4] Display customer info section in OrderDetails
- [ ] T057 [P] [US4] Display device info section in OrderDetails
- [ ] T058 [P] [US4] Display repair info and pricing section in OrderDetails
- [ ] T059 [P] [US4] Display status and dates section in OrderDetails
- [ ] T060 [US4] Connect chat result clicks to main panel order display in `frontend/src/components/ChatPanel/SearchResults.tsx`
- [ ] T061 [US4] Support "show order X" voice command to display order in main panel

**Checkpoint**: Clicking an order in chat or saying "show order X" displays full details in main panel

---

## Phase 7: User Story 5 - FastService Domain Context (Priority: P5)

**Goal**: AI assistant understands FastService terminology in Spanish and English

**Independent Test**: Use Spanish terms like "reparación" and verify correct interpretation

### Backend Implementation for User Story 5

- [ ] T064 [US5] Create FastService system prompt with domain context in `backend/FastService.McpServer/Services/AgentService.cs`
- [ ] T065 [US5] Add Spanish as the only allowed and working language. Everything must be in spanish in the interaction with the user.
- [ ] T066 [US5] Configure agent to maintain conversation context for follow-up questions.

### Frontend Implementation for User Story 5

- [ ] T067 [US5] Add welcome message explaining available commands in ChatPanel

**Checkpoint**: Agent correctly interprets Spanish terms; can explain statuses; maintains context for follow-ups

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T069 [P] Add structured logging to MCP tools in backend
- [ ] T070 [P] Add request correlation IDs for traceability
- [ ] T071 [P] Update README.md with setup instructions at repository root
- [ ] T072 Validate against quickstart.md - ensure dev setup works end-to-end
- [ ] T073 [P] Add input validation (empty messages, invalid order numbers)
- [ ] T074 [P] Performance optimization: add database indexes if query performance is slow
- [ ] T075 Code cleanup: remove unused imports and dead code

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ─────────────────┐
                                ▼
Phase 2: Foundational ──────────┤ ← BLOCKS ALL USER STORIES
                                ▼
┌───────────────────────────────┴───────────────────────────────┐
│                   User Stories (can parallelize)               │
├───────────────────────────────────────────────────────────────┤
│  Phase 3: US1 (Split UI)        ← MVP, no story dependencies  │
│       ▼                                                        │
│  Phase 4: US2 (Basic Chat)      ← Depends on US1 UI           │
│       ▼                                                        │
│  Phase 5: US3 (Order Search)    ← Depends on US2 chat infra   │
│       ▼                                                        │
│  Phase 6: US4 (Order Details)   ← Depends on US3 search       │
│       ▼                                                        │
│  Phase 7: US5 (Domain Context)  ← Can start after US2         │
└───────────────────────────────────────────────────────────────┘
                                ▼
Phase 8: Polish ────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Split UI) | Foundational only | Phase 2 complete |
| US2 (Basic Chat) | US1 | T027 complete |
| US3 (Order Search) | US2 | T037 complete |
| US4 (Order Details) | US3 | T051 complete |
| US5 (Domain Context) | US2 | T037 complete |

### Parallel Opportunities by Phase

**Phase 1 (Setup)**:
```
T001 (backend project) can run in parallel with:
├── T002 (frontend project)
├── T003 (backend config)
├── T004 (frontend env)
```

**Phase 2 (Foundational)**:
```
After T011 (DbContext registered):
├── T013 (tool helpers) [P]
├── T015-T17 (frontend types) [P]
├── T018-T21 (DTOs) [P]
```

**Phase 3 (US1)**:
```
After T022 (SplitLayout):
├── T023 (MainPanel) [P]
├── T024 (ChatPanel) [P]
```

**Phase 5 (US3)**:
```
After T041 (search by customer name):
├── T042 (search by DNI) [P]
├── T043 (search by technician) [P]
├── T044 (search by status) [P]
├── T045 (search by brand/type) [P]
├── T046 (search by serial) [P]
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (~2 hours)
3. Complete Phase 3: US1 - Split UI (~1 hour)
4. Complete Phase 4: US2 - Basic Chat (~2 hours)
5. Complete Phase 5: US3 - Order Search (~3 hours)
6. **STOP and VALIDATE**: Demo conversational order search
7. Total MVP: ~8 hours of development

### Full Feature (Add US4-5)

8. Complete Phase 6: US4 - Order Details (~2 hours)
9. Complete Phase 7: US5 - Domain Context (~2 hours)
10. Complete Phase 8: Polish (~1 hour)
11. Total: ~13 hours of development

### Task Counts

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Setup | 8 | 6 |
| Foundational | 13 | 8 |
| US1 | 7 | 2 |
| US2 | 10 | 0 |
| US3 | 13 | 6 |
| US4 | 10 | 3 |
| US5 | 7 | 0 |
| Polish | 7 | 5 |
| **Total** | **75** | **30** |

---

## Notes

- All backend paths are relative to `backend/FastService.McpServer/`
- All frontend paths are relative to `frontend/`
- EF Core entity scaffolding (T009) requires database connection - ensure VPN/network access
- MCP SDK requires `--prerelease` flag during installation
- Test each user story independently before moving to next
- Commit after each task or logical group
