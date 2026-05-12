# Game API Backend

Production-ready REST API template built on Bun and ElysiaJS. Designed for rapid project bootstrapping with security, scalability, and maintainability as first-class concerns.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Bun                                 |
| Framework     | ElysiaJS                            |
| Language      | TypeScript (strict mode)            |
| Database      | MySQL via Drizzle ORM               |
| Cache / Queue | Redis (ioredis), BullMQ             |
| Storage       | S3-compatible (MinIO / AWS S3)      |
| Auth          | JWT (access + refresh with rotation)|
| Email         | Nodemailer (async via BullMQ)       |
| Logging       | Pino (structured, file rotation)    |
| Validation    | Zod                                 |
| Security      | Helmet, CORS, rate limiting         |

---

## Architecture

```
src/
  config/        # Environment variables, database, redis, storage configs
  cron/          # Scheduled job definitions (BullMQ repeatable jobs)
  db/            # Drizzle ORM schema and database connection management
  lib/           # Shared utilities (logger, queue, storage, rate limiter, etc.)
  middleware/    # Elysia middleware (auth guard, optional auth)
  routes/        # API route definitions (prefixed /api/v1)
  services/      # Business logic (auth, user, etc.)
  types/         # Shared TypeScript type definitions
  validation/    # Zod schemas for request validation
  workers/       # Background job processors (email, cron, sample)
  index.ts       # Application entry point and server bootstrap
```

All routes are mounted under `/api/v1`. Public routes (health, auth) are registered before authenticated routes.

---

## Security

- **Password hashing**: Argon2id via Bun native implementation.
- **Email encryption at rest**: AES-256-GCM with HMAC-SHA256 blind index for lookups without decryption.
- **JWT authentication**: Separate access and refresh tokens with automatic rotation on refresh.
- **Refresh token storage**: Redis-backed with blacklisting and per-user revocation.
- **HTTP-Only cookies**: Refresh tokens are stored in secure, HTTP-Only, SameSite=Strict cookies.
- **Security headers**: Helmet with CSP enforcement in production.
- **Rate limiting**: Redis-based sliding window rate limiter (configurable per route).
- **CORS**: Configurable allowed origins, methods, and headers.
- **Non-root Docker**: Production container runs as unprivileged user.
- **Graceful shutdown**: Ordered teardown of all connections with forced exit timeout.

---

## Setup

### Prerequisites

- [Bun](https://bun.sh) (latest)
- MySQL 8+
- Redis 6+
- MinIO or S3-compatible storage (optional for local dev)

### Installation

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env
# Edit .env with your values (database, redis, JWT secrets, encryption keys)

# Start infrastructure services
docker compose up -d

# Run database migrations
bun run db:migrate

# Start development server (hot reload)
bun run dev
```

### Generating Encryption Keys

JWT secrets and email encryption keys must be cryptographically random 32-byte hex strings:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Scripts

| Command              | Description                              |
|----------------------|------------------------------------------|
| `bun run dev`        | Start development server with hot reload |
| `bun run start`      | Start production server                  |
| `bun run test`       | Run test suite                           |
| `bun run typecheck`  | TypeScript type checking                 |
| `bun run lint`       | ESLint analysis                          |
| `bun run lint:fix`   | ESLint auto-fix                          |
| `bun run format`     | Prettier formatting                      |
| `bun run db:generate`| Generate Drizzle migrations              |
| `bun run db:migrate` | Apply pending migrations                 |
| `bun run db:push`    | Push schema directly (dev only)          |
| `bun run db:studio`  | Open Drizzle Studio GUI                  |

---

## Environment Variables

All variables are documented in `.env.example`. Required variables (no default) will cause the server to fail at startup if missing.

| Category        | Key                          | Required | Default              |
|-----------------|------------------------------|----------|----------------------|
| Server          | `PORT`                       | No       | `3000`               |
| Server          | `NODE_ENV`                   | No       | `development`        |
| Database        | `DATABASE_HOST`              | No       | `localhost`          |
| Database        | `DATABASE_PORT`              | No       | `3306`               |
| Database        | `DATABASE_USER`              | Yes      | --                   |
| Database        | `DATABASE_PASSWORD`          | Yes      | --                   |
| Database        | `DATABASE_NAME`              | Yes      | --                   |
| Database        | `DATABASE_CONNECTION_LIMIT`  | No       | `10`                 |
| Redis           | `REDIS_HOST`                 | No       | `localhost`          |
| Redis           | `REDIS_PORT`                 | No       | `6379`               |
| Redis           | `REDIS_PASSWORD`             | No       | --                   |
| Storage         | `S3_ENDPOINT`                | No       | `http://localhost:9000` |
| Storage         | `S3_REGION`                  | No       | `us-east-1`          |
| Storage         | `S3_ACCESS_KEY`              | No       | `minioadmin`         |
| Storage         | `S3_SECRET_KEY`              | No       | `minioadmin`         |
| Storage         | `S3_BUCKETS`                 | No       | `uploads,images,documents` |
| Security        | `JWT_SECRET_ACCESS`          | Yes      | --                   |
| Security        | `JWT_SECRET_REFRESH`         | Yes      | --                   |
| Security        | `JWT_ACCESS_EXPIRES`         | No       | `15m`                |
| Security        | `JWT_REFRESH_EXPIRES`        | No       | `7d`                 |
| Encryption      | `EMAIL_ENCRYPTION_KEY`       | Yes      | --                   |
| Encryption      | `EMAIL_HMAC_KEY`             | Yes      | --                   |
| Email           | `SMTP_HOST`                  | No       | --                   |
| Email           | `SMTP_PORT`                  | No       | `587`                |
| CORS            | `CORS_ORIGIN`                | No       | `http://localhost:5173` |

Full list available in `.env.example`.

---

## Docker

### Development Infrastructure

The included `docker-compose.yml` starts MySQL, Redis, and MinIO:

```bash
docker compose up -d
```

Services expose the following ports by default:

| Service | Port  | Purpose      |
|---------|-------|--------------|
| MySQL   | 3306  | Database     |
| Redis   | 6379  | Cache/Queue  |
| MinIO   | 9000  | S3 API       |
| MinIO   | 9001  | Web Console  |

### Production Build

The multi-stage Dockerfile compiles a standalone binary with `bun build --compile`:

```bash
docker build -t template-api .
docker run -p 3000:3000 --env-file .env template-api
```

The production image runs as a non-root user and contains only the compiled binary and system CA certificates.

---

## API Endpoints

### Public

| Method | Path                     | Description                    |
|--------|--------------------------|--------------------------------|
| GET    | `/`                      | API information                |
| GET    | `/api/v1/health`         | Basic health check             |
| GET    | `/api/v1/health/ready`   | Readiness check (DB + Redis)   |
| POST   | `/api/v1/auth/register`  | Create account                 |
| POST   | `/api/v1/auth/login`     | Authenticate                   |
| POST   | `/api/v1/auth/refresh`   | Refresh access token           |
| POST   | `/api/v1/auth/logout`    | Invalidate session             |

### Authenticated

| Method | Path                        | Description                |
|--------|-----------------------------|----------------------------|
| GET    | `/api/v1/users/me`          | Get current user profile   |
| PATCH  | `/api/v1/users/me`          | Update profile             |
| PATCH  | `/api/v1/users/me/password` | Change password            |
| DELETE | `/api/v1/users/me`          | Soft-delete account        |

---

## Background Workers

| Worker  | Queue    | Description                                        |
|---------|----------|----------------------------------------------------|
| Cron    | `cron`   | Scheduled jobs registered from `src/cron/jobs/`     |
| Email   | `email`  | Async email sending via nodemailer                  |
| Sample  | `sample` | Example worker demonstrating inline and threaded patterns |

Workers use BullMQ with configurable concurrency, exponential backoff retry, and automatic job cleanup.

---

## License

Unlicensed template. Adapt to your project requirements.
