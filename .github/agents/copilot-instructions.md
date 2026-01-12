# FastServiceAgentic Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-08

## Active Technologies
- TypeScript 5.x (frontend), C# .NET 8 (backend) + React 18, shadcn/ui, Tailwind CSS, Entity Framework Core 8 (003-order-kanban-board)
- Azure SQL Server (existing schema - read-only access) (003-order-kanban-board)
- C# .NET 8 (backend), TypeScript 5.x (frontend) + ASP.NET Core, Entity Framework Core 8, React 18, Tailwind CSS, shadcn/ui (004-compact-order-details)
- Azure SQL Server (existing schema - Reparacion, Cliente, Direccion, ReparacionDetalle, Novedad, TipoNovedad tables) (004-compact-order-details)
- C# / .NET 8.0 + ModelContextProtocol (0.5.0-preview.1 already installed), ModelContextProtocol.AspNetCore (for HTTP transport), Entity Framework Core 8.x (006-mcp-ai-tools)
- Azure SQL Server (existing, unchanged schema per Constitution) (006-mcp-ai-tools)
- C# / .NET 8.0 (existing backend), TypeScript/React (existing frontend) (007-whatsapp-order-integration)
- Azure SQL Server (existing database, new tables required) (007-whatsapp-order-integration)

- C# (.NET 8.0) for backend, TypeScript 5.x for frontend (001-conversational-order-search)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

C# (.NET 8.0) for backend, TypeScript 5.x for frontend: Follow standard conventions

## Recent Changes
- 007-whatsapp-order-integration: Added C# / .NET 8.0 (existing backend), TypeScript/React (existing frontend)
- 006-mcp-ai-tools: Added C# / .NET 8.0 + ModelContextProtocol (0.5.0-preview.1 already installed), ModelContextProtocol.AspNetCore (for HTTP transport), Entity Framework Core 8.x
- 004-compact-order-details: Added C# .NET 8 (backend), TypeScript 5.x (frontend) + ASP.NET Core, Entity Framework Core 8, React 18, Tailwind CSS, shadcn/ui


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
