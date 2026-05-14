# Champions Clash — Admin Dashboard

Administrative control center for the Champions Clash 2027 project. This dashboard provides the tools necessary for managing the live game environment, monitoring player activity, and configuring seasonal warfare.

## Technical Stack

| Component      | Technology                           |
|----------------|--------------------------------------|
| Framework      | Vue 3 (Composition API)              |
| Build Tool     | Vite                                 |
| Language       | TypeScript                           |
| Styling        | Tailwind CSS v4 & PrimeVue           |
| UI Components  | PrimeVue                             |
| State          | Pinia                                |
| Router         | Vue Router                           |
| HTTP Client    | Axios                                |
| Icons          | Lucide Vue Next                      |

## Core Modules

### War & Faction Management
Control the lifecycle of competitive seasons. Create new wars, define faction properties (names, colors, images), and manually conclude active seasons.

### Real-time Game Config
Adjust game parameters on the fly. Manage multipliers, feature flags, and global settings that are instantly reflected in game servers via the backend's hot-reloading configuration system.

### Product Catalog
Manage the in-game shop items, including currency packages and boosters. Update pricing and descriptions without deploying new code.

### Transactions & Analytics
Monitor global economic health through transaction logs and aggregate statistics for mini-games and player progression.

## Project Structure

```text
src/
├── assets/      # Static resources and global styles
├── components/  # Reusable UI components and feature-specific modules
├── composables/ # Shared Vue composition logic (hooks)
├── layouts/     # Page layout definitions
├── lib/         # API client, utilities, and toast configurations
├── router/      # Navigation logic and route guards
├── stores/      # Pinia state management (Auth, Config, UI)
├── types/       # TypeScript interface and type definitions
├── validation/  # Zod schemas for form validation
└── views/       # Main page components
```

## Security

The dashboard uses a key-based authentication mechanism.
- The `X-Admin-Key` must be provided during login.
- The key is securely persisted in local storage and automatically attached to all API requests.
- Unauthorized responses (401/403) trigger an automatic session cleanup and redirect to the login page.

## Development Guide

### Setup
1.  Copy `.env.example` to `.env`.
2.  Configure `VITE_API_URL` to point to your running backend instance.

### Installation
Ensure you have [Bun](https://bun.sh) installed.

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### Build & Quality
```bash
# Production build
bun run build

# Type checking
bun run typecheck

# Linting and formatting
bun run lint
bun run format
```

## Environment Variables

| Variable       | Description                                  | Default                 |
|----------------|----------------------------------------------|-------------------------|
| VITE_API_URL   | Base URL for the Backend API                 | http://localhost:3000   |
| BASE_URL       | Public URL of the dashboard                  | http://localhost:5173   |
