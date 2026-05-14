# Champions Clash — Backend API

The authoritative backend system for the Champions Clash 2027 Roblox experience. This API manages the game economy, faction warfare, player persistence, and administrative controls.

## Technical Stack

| Component      | Technology                           |
|----------------|--------------------------------------|
| Runtime        | Bun                                  |
| Framework      | ElysiaJS                             |
| Language       | TypeScript                           |
| Database       | MySQL (via Drizzle ORM)              |
| Cache / Queue  | Redis & BullMQ                       |
| Validation     | Zod                                  |
| Documentation  | Swagger / OpenAPI                    |
| Logging        | Pino                                 |

## Security Architecture

The API implements a dual-layer security model to isolate game server traffic from administrative operations:

1.  **Roblox Game Interface**: Secured via `X-API-Key`. Used by Roblox game servers to sync player data, process transactions, and update faction scores.
2.  **Administrative Interface**: Secured via `X-Admin-Key`. Used by the Admin Dashboard for configuration, war management, and auditing.

## Core Systems

### Faction Warfare
Manages the lifecycle of competitive seasons ("Wars"). Handles faction enrollment, point accumulation, and automated weekly resets with results snapshotting.

### Economy & Transactions
Authoritative source of truth for player currencies (Coins, Gems). Implements an immutable transaction log and server-side validation to prevent exploits and ensure data integrity.

### Game Configuration
Provides a dynamic configuration system that allows for real-time game adjustments (e.g., XP multipliers, feature flags) without requiring game server restarts.

### Purchase Processing
Handles Roblox Marketplace receipts using an idempotent processing logic to ensure players are credited correctly even in unstable network conditions.

## Project Structure

```text
src/
├── config/      # Environment and global configuration
├── cron/        # Scheduled tasks (BullMQ)
├── db/          # Drizzle schema, migrations, and connection
├── lib/         # Shared utilities (logger, redis, app-error)
├── middleware/  # Elysia middlewares (auth, logging, rate-limit)
├── routes/      # API endpoints definitions
├── services/    # Core business logic
├── types/       # Shared TypeScript definitions
├── validation/  # Zod schemas for request validation
└── workers/     # Background task processors
```

## Development Guide

### Environment Setup
1.  Copy `.env.example` to `.env`.
2.  Configure your local database and Redis credentials.

### Using Docker (Recommended)
The project utilizes Docker Compose with a file-watching system for rapid development.

```bash
# Start development environment with hot-reload
docker compose -f docker-compose.development.yml up --build

# View logs
docker compose -f docker-compose.development.yml logs -f api-dev

# Execute migration
docker compose -f docker-compose.development.yml exec api-dev sh -c "bun run db:generate && bun run db:migrate && bun run db:seed"
```

### Manual Development
Ensure you have [Bun](https://bun.sh) installed.

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Code quality
bun run typecheck
bun run lint
bun run format
```

### Database Management
Migrations are handled via Drizzle Kit.

```bash
# Generate migrations after schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Seed initial data
bun run db:seed
```

## API Documentation
Once the server is running, interactive Swagger documentation is available at:
`http://localhost:3000/api/swagger`
