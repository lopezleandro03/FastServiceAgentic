<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: 0.0.0 → 1.0.0 (Initial ratification)

Modified principles: N/A (initial creation)

Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance

Removed sections: None

Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - Requirements alignment verified
  ✅ tasks-template.md - Task categorization compatible

Follow-up TODOs: None
================================================================================
-->

# FastService Agentic Constitution

## Core Principles

### I. Database Schema Preservation (NON-NEGOTIABLE)

The existing Azure SQL Server database schema MUST remain unchanged. All new features MUST work with the current data model. Any schema modifications require explicit approval and a migration plan that ensures zero downtime and backward compatibility. The connection string and existing schema are provided assets that MUST be respected.

**Rationale**: The legacy application has production data; schema changes risk data integrity and require coordinated deployment with existing systems.

### II. Modern Frontend-Backend Separation

The application MUST be architected as a decoupled system:

- **Frontend**: Modern JavaScript/TypeScript framework with a split-panel UI layout (70% Kanban/detail view on the left, 30% AI assistant chat panel on the right)
- **Backend**: RESTful API service that exposes all business logic
- Communication MUST occur exclusively through well-defined API contracts (OpenAPI/Swagger documented)

**Rationale**: Enables independent scaling, testing, and deployment of frontend and backend components; supports future mobile or alternative clients.

### III. Agentic AI Integration

The AI assistant MUST be treated as a first-class component:

- AI interactions MUST be logged for auditability and improvement
- AI capabilities MUST include: order management assistance, insights generation, and task automation

**Rationale**: The AI assistant is the key differentiator of the rewrite; it must be robust, observable, and never block core business operations.

### IV. Feature Parity First

The rewritten application MUST achieve functional parity with the Baseline application before adding new capabilities:

- Kanban board for order lifecycle management (create, update, track orders)
- Order detail views with full edit capability
- Reporting features for order data analysis
- All existing core user workflows MUST be preserved or improved

**Rationale**: Users depend on existing functionality; new features are valueless if core workflows break.

### V. Observability & Traceability

All system components MUST implement structured logging and monitoring:

- API requests/responses MUST be logged with correlation IDs
- AI agent interactions MUST be traceable end-to-end
- Errors MUST include sufficient context for debugging without exposing sensitive data

**Rationale**: A distributed system with AI components requires comprehensive observability to diagnose issues and optimize performance.

## Technology Stack

The following technology constraints apply to all development:

| Layer | Requirement |
|-------|-------------|
| **Database** | Azure SQL Server (existing, unchanged schema) |
| **Backend** | .NET (C#) with RESTful API design |
| **Frontend** | Modern JS/TS framework (React, Vue, or Angular) |
| **AI Integration** | Azure OpenAI |
| **Hosting** | Azure App Service (consistent with current deployment) |
| **CI/CD** | GitHub Actions (existing pipeline to be extended). New pipelines to be created to run the new application side by side with the legacy system |

**Constraints**:
<!-- 
- All dependencies MUST have active maintenance and security updates
- Third-party libraries MUST be evaluated for license compatibility
- Frontend bundle size SHOULD remain under 500KB (gzipped) for initial load 
-->

## Development Workflow

### Quality Gates

All code changes MUST pass these gates before merge:

1. **Linting**: Code MUST pass configured linters with zero errors
2. **Unit Tests**: New code MUST include unit tests; coverage MUST not decrease
3. **Integration Tests**: API endpoints MUST have contract tests
4. **Build**: Application MUST build successfully in CI environment
5. **Review**: At least one team member MUST approve changes

### Branch Strategy

- `main`: Production-ready code only
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `hotfix/*`: Emergency production fixes

### Documentation Requirements

- API changes MUST update OpenAPI specifications
- Architecture decisions MUST be recorded in decision logs

## Governance

This constitution supersedes all other development practices for the FastService Agentic project. Amendments require:

1. Written proposal documenting the change and rationale
2. Impact analysis on existing code and workflows
3. Team review and approval
4. Version increment following semantic versioning:
   - **MAJOR**: Backward-incompatible governance or principle changes
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording, or non-semantic refinements

All pull requests and code reviews MUST verify compliance with these principles. Complexity beyond these guidelines MUST be justified in the implementation plan with documented rationale.

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
