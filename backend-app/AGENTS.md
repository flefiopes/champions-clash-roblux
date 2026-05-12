# Template WebApp - Agent Documentation

This document describes the structure, technical stack, and strict development rules for this monorepo. It serves as the authoritative context and instruction manual for AI agents working on this project.

## Environment

- **OS**: Windows 10
- **Shell**: PowerShell (be careful with the commands, they are not the same as in Linux: don't use "<" or ">" or other grep commands)
- **Containerization**: Docker (Docker Compose for local infrastructure)

## Technical Stack

### Backend (Server)
- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Language**: TypeScript (strict mode)
- **Database**: MySQL (via Drizzle ORM)
- **Cache & Queue**: Redis (ioredis), BullMQ
- **Validation**: Zod
- **Logging**: Pino

## Project Structure

### Root
- `frontend/`: Frontend application (Vue 3 / Vite)
- `backend/`: Backend application API (Bun / ElysiaJS)
- `AGENTS.md`: This rules and configuration file

### Backend (`backend/src`)
- `config/`: Environment and infrastructure configurations
- `cron/`: Scheduled jobs via BullMQ
- `db/`: Drizzle schemas and database connection management
- `lib/`: Shared utilities (logger, queue, storage, rate limiter)
- `middleware/`: Elysia middlewares
- `routes/`: API endpoint definitions (must remain thin)
- `services/`: Core business logic and database operations
- `types/`: Shared TypeScript type definitions
- `validation/`: Zod schemas for request validation
- `workers/`: Background job processors

## Development Rules

### General
- **Language**: All code comments and documentation must be written in English.
- **TypeScript Strict**: Always use explicit types or rely on strict type inference. Never use `any`.
- **Formatting**: Always format code using Prettier.
- **Linting**: Adhere strictly to ESLint rules. 
- **Naming Conventions**: 
  - Files and directories: `kebab-case.ts` (e.g., `user-service.ts`)
  - Vue Components: `PascalCase.vue` (e.g., `UserProfile.vue`)
  - Classes: `PascalCase`
  - Variables and Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Documentation**: Include a concise English comment at the top of each file and each functions explaining its purpose. Comment **complex logic** precisely without stating the obvious.
- **Mandatory Post-Modification Workflow**: After any major code changes in this folder, you MUST execute the following commands in the respective directory to ensure code quality (run them in order):
  1. `bun format`
  2. `bun lint:fix`
  3. `bun typecheck`
  Or execute `bun format; bun lint:fix; bun typecheck`
  *Note: Agents must resolve any errors thrown by these checks before considering a task complete.*

### Backend Rules
- **Architecture Enforcement**: The underlying architectural flow is `Router -> Service -> Database`.
- **Routes**: Route files must be as simple and thin as possible. They should only handle HTTP concerns (receiving requests, calling services, returning responses).
- **Services**: ALL business logic, data formatting, and database interactions MUST be encapsulated within the `services/` directory.
- **Async Pattern**: Always use `async/await` syntax. Do not use `.then()` chains.
- **Database Access**: Operations targeting the database must exclusively use Drizzle ORM.
- **Error Handling**: Bubble errors up to be handled by Elysia's built-in error mechanisms.
- **Environment Variables**: Never hardcode sensitive information (database credentials, API keys, etc.) in the code. Always use environment variables via the `config/` module.
- **Type Safety**: Always use explicit types or rely on strict type inference. Never use `any`.

## Essential Commands

### Backend (`cd backend`)
- `bun run dev`: Start the development server
- `bun run db:generate`: Generate Drizzle migrations
- `bun run db:migrate`: Apply database migrations
- `bun lint`: Lint codebase
- `bun typecheck`: Verify TypeScript types
- `bun format`: Format codebase with Prettier

Note : do not use `bun run db:generate` or `bun run db:migrate` unless explicitly asked by the user. If you need to do a migration, ask the user to do it manually.
