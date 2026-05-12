# Template API Frontend

Production-ready frontend application built with Vue 3 and Vite. Designed for rapid development with a focus on maintainability, type safety, and modern UI practices.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | Vue 3 (Composition API)             |
| Build Tool    | Vite                                |
| Language      | TypeScript (strict mode)            |
| Styling       | Tailwind CSS v4 + PrimeUI           |
| Components    | PrimeVue                            |
| State         | Pinia                               |
| Router        | Vue Router                          |
| HTTP Client   | Axios                               |
| Icons         | PrimeIcons                          |
| Validation    | Zod (via shared types/validation)   |
| Linter        | ESLint 10 + Prettier                |

---

## Architecture

```
src/
  assets/        # Static assets (images, fonts, global CSS/Tailwind)
  components/    # Reusable Vue components (UI and specialized)
  composables/   # Vue composition API functions (hooks)
  layouts/       # Page layout wrappers (e.g. AuthLayout, MainLayout)
  lib/           # Shared utilities (API client interceptors, helpers)
  router/        # Vue router configuration and route guards
  stores/        # Pinia state management stores
  types/         # Shared TypeScript type definitions
  views/         # Main application route pages
  App.vue        # Root Vue component
  main.ts        # Application entry point and bootstrapping
```

---

## Security & Best Practices

- **Strict Type Safety**: TypeScript with strict mode enabled.
- **Composition API**: Leverage Vue's latest features for predictable and modular logic.
- **API Interceptors**: Axios configured for robust central error handling and token management.
- **Route Guards**: Protection of sensitive routes using Vue Router before guards.
- **Component Design**: Separation of concerns with smart (views) and dumb (components) components.
- **Environment Driven**: Isolated configuration using `.env` variables for different environments.

---

## Setup

### Prerequisites

- [Bun](https://bun.sh) (latest)
- Backend API running (see `backend/README.md`)

### Installation

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env
# Edit .env with your local backend API URL if needed

# Start development server
bun run dev
```

---

## Scripts

| Command              | Description                              |
|----------------------|------------------------------------------|
| `bun run dev`        | Start development server with hot reload (Vite) |
| `bun run build`      | Typecheck and build for production       |
| `bun run preview`    | Locally preview production build         |
| `bun run typecheck`  | Run TypeScript type checking (`vue-tsc`) |
| `bun run lint`       | ESLint static code analysis              |
| `bun run lint:fix`   | ESLint auto-fix common issues            |
| `bun run format`     | Format code with Prettier                |

---

## Environment Variables

All variables are documented in `.env.example`.

| Key                        | Description                                  | Default                 |
|----------------------------|----------------------------------------------|-------------------------|
| `BASE_URL`                 | Application base URL                         | `http://localhost:5173` |
| `VITE_API_URL`             | Backend API base URL (without trailing slash)| `http://localhost:3000` |
| `VITE_USE_SECURE_COOKIE`   | Set to `true` to mandate secure cookies in prod | `false`                 |

---

## License

Unlicensed template. Adapt to your project requirements.
