# Implementation Plan: Shadcn-UI Design System Migration

**Branch**: `002-shadcn-ui-migration` | **Date**: January 8, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-shadcn-ui-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate the FastService Agentic frontend from custom CSS to shadcn-ui component library, delivering a modern, accessible, and consistent design system while preserving the 70/30 split layout and all existing functionality. The migration will replace custom-styled components with shadcn-ui primitives (Button, Input, Table, Card, Badge, Skeleton) to improve visual consistency, reduce maintenance burden, and accelerate future UI development.

**Key Technical Approach**:
- Install shadcn-ui CLI and required dependencies (Radix UI, class-variance-authority, tailwind-merge)
- Configure TailwindCSS with shadcn design tokens
- Incrementally migrate components in 5 phases: foundation components → status/loading → cards → tables → polish
- Maintain Spanish UI text and all backend integrations unchanged
- Preserve 70/30 split layout with responsive breakpoints

## Technical Context

**Language/Version**: TypeScript 4.9.5, React 19.2.3  
**Primary Dependencies**: react-scripts 5.0.1, TailwindCSS 3.x (to be configured), shadcn-ui (latest stable), Radix UI primitives, class-variance-authority, tailwind-merge  
**Storage**: N/A (frontend only, uses existing backend API)  
**Testing**: Jest via react-scripts, React Testing Library 16.3.1, manual cross-browser testing  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web application (frontend only modification)  
**Performance Goals**: Maintain FCP < 1.5s, TTI < 3.5s on 3G; bundle size increase < 15%  
**Constraints**: Must preserve 70/30 split layout, maintain WCAG 2.1 AA accessibility, zero functional regressions  
**Scale/Scope**: ~15 React components to migrate, ~500 lines of custom CSS to replace, 5 user stories (2 P1, 2 P2, 1 P3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Database Schema Preservation (NON-NEGOTIABLE)
**Status**: PASS - Not Applicable  
**Justification**: This is a frontend-only UI migration. Zero database schema changes required. Backend API and data model remain completely unchanged.

### ✅ II. Modern Frontend-Backend Separation
**Status**: PASS - Compliant  
**Justification**: Migration maintains the existing decoupled architecture. Frontend changes are purely presentational (component styling). All API contracts, communication patterns, and backend interactions remain identical.

### ✅ III. Agentic AI Integration
**Status**: PASS - Compliant  
**Justification**: AI chat panel component receives visual updates only. All AI interaction logic (message sending, response handling, conversation history) remains unchanged in hooks and services.

### ✅ IV. Feature Parity First
**Status**: PASS - Compliant  
**Justification**: Migration explicitly requires zero functional changes (FR-009). All existing workflows (chat, search, order details, navigation) must work identically. This is a "feature parity mandatory" change - visual upgrade only.

### ✅ V. Observability & Traceability
**Status**: PASS - Not Applicable  
**Justification**: Frontend UI component migration does not affect logging, monitoring, or tracing infrastructure. Backend observability remains unchanged.

**Overall Gate Status**: ✅ **PASS** - All constitutional principles respected. Zero violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-shadcn-ui-migration/
├── plan.md                   # This file (/speckit.plan command output)
├── research.md               # Phase 0 output - shadcn-ui setup research
├── data-model.md             # Phase 1 output - N/A (no data changes)
├── quickstart.md             # Phase 1 output - component migration guide
├── contracts/                # Phase 1 output - N/A (no API changes)
├── checklists/
│   └── requirements.md       # Spec quality validation (complete)
└── spec.md                   # Feature specification (complete)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/               # NEW: shadcn-ui components directory
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── separator.tsx
│   │   ├── ChatPanel/
│   │   │   ├── ChatPanel.tsx       # MODIFIED: use shadcn Button, Input
│   │   │   ├── MessageInput.tsx    # MODIFIED: use shadcn Input, Button
│   │   │   └── index.ts
│   │   ├── MainPanel/
│   │   │   ├── MainPanel.tsx       # MODIFIED: use shadcn Button, Card
│   │   │   └── index.ts
│   │   └── Orders/
│   │       ├── OrderList.tsx       # MODIFIED: use shadcn Table
│   │       ├── OrderDetailsView.tsx# MODIFIED: use shadcn Card, Badge
│   │       ├── StatusBadge.tsx     # REPLACED: with shadcn Badge
│   │       └── index.ts
│   ├── hooks/
│   │   └── useChat.ts              # UNCHANGED: logic preserved
│   ├── services/
│   │   └── api.ts                  # UNCHANGED: backend integration
│   ├── types/
│   │   ├── chat.ts                 # UNCHANGED
│   │   └── order.ts                # UNCHANGED
│   ├── lib/
│   │   └── utils.ts                # NEW: shadcn utilities (cn helper)
│   ├── App.tsx                     # MODIFIED: apply global theme
│   ├── App.css                     # MODIFIED: remove conflicting styles
│   ├── index.css                   # MODIFIED: add shadcn CSS variables
│   └── index.tsx                   # UNCHANGED
├── tailwind.config.js              # NEW: TailwindCSS config with shadcn tokens
├── postcss.config.js               # NEW: PostCSS config for Tailwind
├── components.json                 # NEW: shadcn-ui CLI configuration
├── package.json                    # MODIFIED: add shadcn dependencies
└── tsconfig.json                   # POTENTIALLY MODIFIED: path aliases

backend/                             # UNCHANGED: zero backend modifications
└── FastService.McpServer/
```

**Structure Decision**: This is a frontend-only migration following Option 2 (Web application). The `frontend/` directory is the sole modification target. A new `src/components/ui/` directory will house shadcn-ui components installed via CLI. Existing component files in `ChatPanel/`, `MainPanel/`, and `Orders/` will be updated to import and use shadcn primitives instead of custom JSX/CSS.

## Complexity Tracking

> **No constitution violations** - This table is empty as all constitutional checks passed.

---

## Post-Design Constitution Check

*Re-evaluated after Phase 1 (Design & Contracts) completion*

### ✅ I. Database Schema Preservation (NON-NEGOTIABLE)
**Status**: PASS - Confirmed  
**Design Impact**: Zero. No data model changes introduced. All components consume existing Order and Customer entities via unchanged API contracts.

### ✅ II. Modern Frontend-Backend Separation
**Status**: PASS - Confirmed  
**Design Impact**: API contracts remain completely unchanged. Frontend components consume the same `/api/chat` and `/api/orders/*` endpoints with identical request/response formats. The separation boundary is preserved.

### ✅ III. Agentic AI Integration
**Status**: PASS - Confirmed  
**Design Impact**: AI chat logic (useChat hook, message handling, conversation history) is untouched. Visual presentation of chat panel updated only. AI observability and logging unaffected.

### ✅ IV. Feature Parity First
**Status**: PASS - Confirmed  
**Design Impact**: All 20 functional requirements explicitly preserve existing functionality (FR-009). Component migration plan (quickstart.md) includes comprehensive testing to verify zero functional regressions.

### ✅ V. Observability & Traceability
**Status**: PASS - Confirmed  
**Design Impact**: No changes to backend logging, tracing, or monitoring. Frontend error boundaries and console logging remain unchanged.

**Overall Post-Design Gate Status**: ✅ **PASS** - Design maintains full constitutional compliance.

---

## Implementation Phases

### Phase 0: Research (COMPLETE)
**Deliverable**: [research.md](./research.md)

**Status**: ✅ Complete  
**Findings**:
- Shadcn-ui CLI-based installation strategy validated
- TailwindCSS configuration requirements documented
- React 19 compatibility confirmed
- 5-phase incremental migration strategy defined
- FastService branding integration approach determined
- Bundle size impact estimated at ~35-45KB gzipped (within 15% target)
- Testing strategy (automated + visual + manual) established
- Rollback plan (git-based per-phase commits) documented

### Phase 1: Design & Contracts (COMPLETE)
**Deliverables**: [quickstart.md](./quickstart.md), ~~data-model.md~~ (N/A), ~~contracts/~~ (N/A)

**Status**: ✅ Complete  
**Outputs**:
- **quickstart.md**: Comprehensive step-by-step implementation guide with 5 migration phases
  - Phase 0: Setup & Configuration (TailwindCSS, shadcn-ui init)
  - Phase 1: Foundation Components (Button, Input, Textarea)
  - Phase 2: Status & Loading (Badge, Skeleton)
  - Phase 3: Card Layout (Card, Separator)
  - Phase 4: Table Component
  - Phase 5: Polish & Cleanup
- **data-model.md**: Not applicable (no data entities changed)
- **contracts/**: Not applicable (no API changes)

**Agent Context Update**: Not required (frontend-only change; no new backend technologies introduced)

### Phase 2: Task Breakdown
**Deliverable**: `tasks.md` (generated by `/speckit.tasks` command - NOT PART OF THIS PLAN)

**Status**: ⏸️ Pending  
**Next Action**: Run `/speckit.tasks` to generate granular task breakdown from quickstart.md phases

---

## Success Metrics

Based on Success Criteria from [spec.md](./spec.md):

| ID | Metric | Target | Validation Method |
|----|--------|--------|-------------------|
| SC-001 | Task completion time | Same or faster | Manual stopwatch testing of chat → search → details flow |
| SC-002 | WCAG 2.1 AA compliance | 100% of components | Lighthouse + axe DevTools automated audit |
| SC-003 | Performance budget | FCP < 1.5s, TTI < 3.5s | Lighthouse audit on 3G throttling |
| SC-004 | Functional test pass rate | 100% | Manual testing checklist in quickstart.md |
| SC-005 | Visual regression | Zero unintended breaks | Before/after screenshot comparison |
| SC-006 | Responsive layout | 70/30 split at 375px, 768px, 1024px+ | Manual testing at breakpoints |
| SC-007 | Professional appearance | 20% improvement in rating | User survey (5-point scale, pre/post) |
| SC-008 | Cross-browser consistency | Chrome, Firefox, Safari, Edge | Manual visual testing in 4 browsers |
| SC-009 | Development velocity | Improved (subjective) | Developer survey post-migration |
| SC-010 | CSS reduction | 30%+ reduction | Line count comparison of App.css before/after |

---

## Risk Register

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Bundle size exceeds 15% target | Medium | Low | Monitor with `npm run build`; lazy load components if needed | Developer |
| Color contrast fails WCAG | Low | Medium | Validate with Lighthouse; adjust CSS variables if needed | Designer/Developer |
| React 19 compatibility issue | Very Low | High | Pin Radix UI versions; fallback to React 18 if critical | Developer |
| Spanish text rendering issue | Very Low | Medium | Test all UI text early; verify font character set | Developer |
| Responsive layout breaks | Low | Medium | Test at all breakpoints during each phase | Developer |
| Development takes longer than estimated | Medium | Low | 10-15hr estimate has buffer; can defer Phase 5 polish if tight | PM/Developer |

---

## Dependencies & Blockers

**Dependencies**:
- ✅ Feature 001 (Conversational Order Search) complete and on main branch
- ✅ Frontend development environment functional (Node 18+, npm)
- ✅ Git branch `002-shadcn-ui-migration` created and checked out

**Blockers**:
- ⚠️ None currently identified. If FastService brand colors are not documented, will use default shadcn slate theme.

---

## Deployment Notes

**Deployment Strategy**: Standard frontend build and deploy (same as Feature 001)

```bash
# Build production bundle
cd frontend
npm run build

# Deploy build/ directory to hosting (Azure Static Web Apps or App Service)
# No backend changes required
```

**Rollback Plan**: Git-based rollback to commit before merge of 002-shadcn-ui-migration branch

**Testing in Production**: 
- Smoke test: Load app, send chat message, view order details
- Visual inspection: Verify shadcn styling is applied
- Performance: Run Lighthouse audit on production URL

**Monitoring**: 
- Watch for increased error rates in browser console
- Monitor page load times (should be unchanged or improved)
- Check for user feedback on visual changes

---

## Plan Approval

**Plan Status**: ✅ COMPLETE - Ready for Implementation

**Approvals Required**:
- [ ] Tech Lead: Architecture and technical approach
- [ ] Product Owner: User story priorities and success criteria
- [ ] Design Lead: Brand color customization and visual direction

**Next Steps**:
1. Obtain approvals from stakeholders
2. Run `/speckit.tasks` to generate granular task breakdown
3. Begin implementation following [quickstart.md](./quickstart.md)
4. Commit after each phase for incremental progress
5. Run final validation checklist before merge to main

---

**Plan Generated**: January 8, 2026  
**Last Updated**: January 8, 2026  
**Version**: 1.0
