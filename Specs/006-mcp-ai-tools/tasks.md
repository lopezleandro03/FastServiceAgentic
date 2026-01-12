# Tasks: MCP AI Tools Server

**Input**: Design documents from `/specs/006-mcp-ai-tools/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Tests are NOT explicitly requested in the feature specification. Manual validation via quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions (from plan.md)

- **Backend**: `backend/FastService.McpServer/`
- **Tools**: `backend/FastService.McpServer/Tools/`
- **Services**: `backend/FastService.McpServer/Services/`

---

## Phase 1: Setup

**Purpose**: Add MCP dependencies and configure the server infrastructure

- [ ] T001 Add ModelContextProtocol.AspNetCore package to backend/FastService.McpServer/FastService.McpServer.csproj
- [ ] T002 Configure MCP server services in backend/FastService.McpServer/Program.cs (AddMcpServer, WithHttpTransport, WithToolsFromAssembly)
- [ ] T003 Map MCP endpoint at /mcp in backend/FastService.McpServer/Program.cs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story tools can be implemented

**⚠️ CRITICAL**: No tool implementation can begin until this phase is complete

- [ ] T004 Create ToolResponseHelper utility class in backend/FastService.McpServer/Tools/ToolResponseHelper.cs for consistent JSON response formatting
- [ ] T005 [P] Update ToolHelpers.cs in backend/FastService.McpServer/Tools/ToolHelpers.cs to add MCP-specific serialization helpers
- [ ] T006 Verify MCP server starts and /mcp endpoint responds to tools/list request

**Checkpoint**: MCP infrastructure ready - tool implementation can now begin

---

## Phase 3: User Story 1 - Query Orders from External Client (Priority: P1) 🎯 MVP

**Goal**: Enable MCP clients to query order information using 6 order tools

**Independent Test**: Connect Claude Desktop or curl to http://localhost:5207/mcp, call SearchOrderByNumber with orderNumber=12345, verify order details returned

### Implementation for User Story 1

- [ ] T007 [US1] Refactor SearchOrdersByNumberAsync to use [McpServerTool] attribute in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T008 [US1] Refactor SearchOrdersByCustomerAsync to use [McpServerTool] attribute in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T009 [US1] Refactor SearchOrdersByStatusAsync to use [McpServerTool] attribute in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T010 [US1] Refactor SearchOrdersByDNIAsync to use [McpServerTool] attribute in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T011 [US1] Refactor SearchOrdersByDeviceAsync to use [McpServerTool] attribute in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T012 [US1] Refactor GetAllStatusesAsync to use [McpServerTool] attribute in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T013 [US1] Add [McpServerToolType] attribute to OrderSearchTools class in backend/FastService.McpServer/Tools/OrderSearchTools.cs
- [ ] T014 [US1] Test all 6 order tools via curl/MCP client per quickstart.md validation steps

**Checkpoint**: User Story 1 complete - external clients can query orders via MCP

---

## Phase 4: User Story 2 - Answer Customer Questions (Priority: P1)

**Goal**: Enable MCP clients to query customer information using 5 customer tools

**Independent Test**: Call SearchCustomerByName with name="García" and verify customer list returned with order counts

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create CustomerTools.cs with [McpServerToolType] attribute in backend/FastService.McpServer/Tools/CustomerTools.cs
- [ ] T016 [US2] Implement SearchCustomerByName tool in backend/FastService.McpServer/Tools/CustomerTools.cs using ClientService.SearchClientsAsync
- [ ] T017 [US2] Implement GetCustomerByDNI tool in backend/FastService.McpServer/Tools/CustomerTools.cs using ClientService.GetClientByDniAsync
- [ ] T018 [US2] Implement GetCustomerById tool in backend/FastService.McpServer/Tools/CustomerTools.cs using ClientService.GetClientDetailsAsync
- [ ] T019 [US2] Implement GetCustomerOrderHistory tool in backend/FastService.McpServer/Tools/CustomerTools.cs (filter orders by customerId)
- [ ] T020 [US2] Implement GetCustomerStats tool in backend/FastService.McpServer/Tools/CustomerTools.cs using ClientService.GetClientDetailsAsync stats
- [ ] T021 [US2] Test all 5 customer tools via curl/MCP client per quickstart.md validation steps

**Checkpoint**: User Story 2 complete - external clients can query customers via MCP

---

## Phase 5: User Story 3 - Answer Accounting Questions (Priority: P2)

**Goal**: Enable MCP clients to query accounting/sales information using 4 accounting tools

**Independent Test**: Call GetSalesSummary and verify sales totals for today/week/month/year returned

### Implementation for User Story 3

- [ ] T022 [P] [US3] Create AccountingTools.cs with [McpServerToolType] attribute in backend/FastService.McpServer/Tools/AccountingTools.cs
- [ ] T023 [US3] Implement GetSalesSummary tool in backend/FastService.McpServer/Tools/AccountingTools.cs using AccountingService.GetSalesSummaryAsync
- [ ] T024 [US3] Implement GetSalesForPeriod tool in backend/FastService.McpServer/Tools/AccountingTools.cs using AccountingService.GetSalesChartDataAsync
- [ ] T025 [US3] Implement GetSalesByPaymentMethod tool in backend/FastService.McpServer/Tools/AccountingTools.cs (add helper to AccountingService if needed)
- [ ] T026 [US3] Implement GetRecentSales tool in backend/FastService.McpServer/Tools/AccountingTools.cs using AccountingService.GetSalesMovementsAsync
- [ ] T027 [US3] Test all 4 accounting tools via curl/MCP client per quickstart.md validation steps

**Checkpoint**: User Story 3 complete - external clients can query accounting data via MCP

---

## Phase 6: User Story 4 - Web App Continues to Work (Priority: P1)

**Goal**: Maintain backward compatibility with existing web app chat interface

**Independent Test**: Use existing web app chat to ask "Buscá la orden 12345" and verify response quality/speed unchanged

### Implementation for User Story 4

- [ ] T028 [US4] Update AgentService to discover MCP tools and use them for tool execution in backend/FastService.McpServer/Services/AgentService.cs
- [ ] T029 [US4] Update DefineChatTools() in AgentService to generate tool definitions from MCP tool metadata in backend/FastService.McpServer/Services/AgentService.cs
- [ ] T030 [US4] Update ExecuteToolAsync() in AgentService to route calls to MCP tool implementations in backend/FastService.McpServer/Services/AgentService.cs
- [ ] T031 [US4] Test /api/chat endpoint with existing web app queries to verify backward compatibility
- [ ] T032 [US4] Performance test: verify response time <2s for single lookups, <5s for searches

**Checkpoint**: User Story 4 complete - web app chat works identically to before

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T033 [P] Update backend/AI-ARCHITECTURE.md with MCP server architecture documentation
- [ ] T034 [P] Add MCP configuration example to backend/FastService.McpServer/appsettings.Development.json
- [ ] T035 Run quickstart.md full validation: test with Claude Desktop, VS Code, and curl
- [ ] T036 Verify all 16 tools have complete [Description] attributes for AI understanding (SC-006)
- [ ] T037 Test 10 concurrent MCP client connections without degradation (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user story tools
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1, US2, US4 are P1 priority - should be done before US3
  - US1 and US2 can proceed in parallel (different tool files)
  - US4 depends on US1 completion (needs order tools working first)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational ──────────────────────────────────┐
    │                                                    │
    ├──────────────┬───────────────────────┐            │
    │              │                       │            │
    ▼              ▼                       ▼            │
Phase 3: US1   Phase 4: US2           Phase 5: US3     │
(Order Tools)  (Customer Tools)       (Accounting)     │
    │              │                       │            │
    │              │                       │            │
    └──────────────┴───────────────────────┘            │
                   │                                    │
                   ▼                                    │
            Phase 6: US4 (Web App Backward Compat) ◄────┘
                   │
                   ▼
            Phase 7: Polish
```

### Parallel Opportunities

**Phase 1**: All setup tasks sequential (same file: Program.cs, csproj)

**Phase 2**: T004 and T005 can run in parallel (different files)

**Phase 3 (US1)**: Tasks T007-T012 affect same file - must be sequential or combined

**Phase 4 (US2)**: T015 creates file, then T016-T020 sequential (same file)

**Phase 5 (US3)**: T022 creates file, then T023-T026 sequential (same file)

**Phase 3 + Phase 4**: Can run in parallel (different tool files: OrderSearchTools.cs vs CustomerTools.cs)

**Phase 3 + Phase 5**: Can run in parallel (different tool files: OrderSearchTools.cs vs AccountingTools.cs)

**Phase 7**: T033 and T034 can run in parallel (different files)

---

## Parallel Example: US1 + US2 Together

```bash
# Developer A: User Story 1 (Order Tools)
T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014

# Developer B: User Story 2 (Customer Tools) - can start at same time
T015 → T016 → T017 → T018 → T019 → T020 → T021
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 - Order Tools (T007-T014)
4. **STOP and VALIDATE**: Test order tools via curl and Claude Desktop
5. Deploy/demo if ready - MCP server working for order queries!

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add User Story 1 (Orders) → Test → **MVP deployed!**
3. Add User Story 2 (Customers) → Test → Enhanced capability
4. Add User Story 4 (Backward Compat) → Test → Web app still works
5. Add User Story 3 (Accounting) → Test → Business intelligence queries
6. Polish → Documentation and final validation

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Setup | T001-T003 | MCP package and server configuration |
| 2. Foundational | T004-T006 | Response helpers and endpoint verification |
| 3. US1 Orders | T007-T014 | 6 order tools with MCP attributes |
| 4. US2 Customers | T015-T021 | 5 customer tools (new file) |
| 5. US3 Accounting | T022-T027 | 4 accounting tools (new file) |
| 6. US4 Web Compat | T028-T032 | AgentService integration |
| 7. Polish | T033-T037 | Documentation and validation |

**Total Tasks**: 37  
**Tasks per User Story**: US1=8, US2=7, US3=6, US4=5, Setup/Foundation=6, Polish=5  
**Parallel Opportunities**: 6 identified (T004∥T005, T033∥T034, US1∥US2, US1∥US3, US2∥US3)  
**Suggested MVP**: Phase 1 + 2 + 3 (Tasks T001-T014) = Order queries working via MCP
