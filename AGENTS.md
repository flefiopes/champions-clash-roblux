---
name: champions-clash-development
description: Comprehensive development framework for Champions Clash 2027 – a competitive Roblox game with polarized team mechanics. Covers game logic, backend systems, economy, and player engagement infrastructure.
---

# Champions Clash 2027 — Agent Framework

## Project Overview

**Champions Clash 2027** is a competitive Roblox experience centered on polarized team warfare with real-time player engagement and persistent progression systems. The architecture comprises three integrated layers:

1. **Roblox Client** – Game loop, UI, mini-games, real-time player experience
2. **Backend API** – Data persistence, war management, economy validation, leaderboards
3. **Administration Layer** – War creation, configuration, theme management, performance monitoring

---

## Core Architecture

```
┌─ ROBLOX STUDIO (Lua) ─────────────────────────────────────┐
│  • Game Hub (player spawn, camp selection, UI framework)   │
│  • Mini-Game Modules (isolated, pluggable game systems)    │
│  • HUD & Shop UI (real-time score tracking, monetization)  │
└─────────────────────────────────────────────────────────────┘
                              │
                    HttpService (HTTPS)
                              │
┌─ BACKEND INFRASTRUCTURE ──────────────────────────────────┐
│  • REST API (Node.js / Fastify)                           │
│  • Primary Database (PostgreSQL)                           │
│  • Admin Dashboard (web interface)                         │
│  • Real-time Webhooks (Discord, push notifications)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Roles & Responsibilities

### 1. **Roblox Game Developer** → `roblox-development`

**Scope**: In-game Lua scripting, game systems, player experience, client-side logic.

**Primary Responsibilities**:
- Develop game loop, player spawning, and hub navigation
- Implement camp selection mechanism with real-time faction counts
- Build mini-game modules (modular, reusable architecture)
- Create HUD, leaderboards, and real-time score displays
- Handle HttpService calls to backend (signing requests, parsing responses)
- Optimize performance for concurrent player counts
- Client-side prediction and lag compensation

**Key Reference**: See `SKILL.md` for Roblox development principles, DataStore considerations, and platform-specific optimization strategies.

**Integration Points**:
- Must call Backend API for all persistent state (coins, gems, war scores, player profile)
- Receives configuration from `/config` endpoint
- Submits player actions (coin gains, point contributions) via POST requests

---

### 2. **Backend API Developer** → `backend-development`

**Scope**: REST API, database schema, game economy logic, security, scalability.

**Primary Responsibilities**:
- Design and implement REST endpoints for player management, wars, transactions
- Implement server-side validation for all game economy actions
- Manage PostgreSQL database schema (players, wars, leaderboards, transactions)
- Handle authentication and request signing (X-API-Key validation)
- Implement leaderboard queries and caching strategies
- Create admin dashboard for war management and monitoring
- Set up webhooks for Discord notifications and push alerts
- Ensure data consistency and prevent economy exploits

**Core Endpoints** (minimum viable set):
```
POST   /players/login                 → Player creation/authentication
GET    /players/{userId}              → Player profile retrieval
POST   /players/{userId}/coins        → Economy transaction (validated)
POST   /players/{userId}/points       → Contribute faction points
GET    /wars/active                   → Retrieve active wars + scores
GET    /wars/{warId}/leaderboard      → Top 100 players per faction
GET    /config                        → Runtime game configuration
```

**Database Tables** (core schema):
- `players` – User profiles, faction, progression
- `wars` – War definitions, state, reset cycles
- `faction_scores` – Real-time accumulation (weekly & all-time)
- `transactions` – Audit log (coin gains, transfers, economy actions)
- `leaderboards` – Pre-computed top-N caches (updated incrementally)

---

### 3. **Project Architect** → `project-architect`

**Scope**: System design, project coordination, cross-layer integration, roadmap execution.

**Primary Responsibilities**:
- Coordinate between Roblox client and backend teams
- Define phase milestones and deliverables
- Establish security protocols and API contracts
- Design data flow and integration patterns
- Manage configuration and feature flags
- Monitor deployment pipeline and health metrics
- Prioritize features based on core loop validation

**Key Principles**:
- **Core Loop First**: Complete the play → earn → contribute → compete cycle before secondary features
- **Ship Fast**: Deploy playable builds early; iterate based on real player engagement data
- **Modular Design**: Each mini-game and backend system developed independently, integrated via common hub
- **External Source of Truth**: Backend database is authoritative for all persistent state; Roblox caches locally

---

## Project Structure

```
champions-clash-roblux/
├── project/                              # Roblox Studio project
│   ├── src/
│   │   ├── client/init.client.luau      # Player-facing game loop
│   │   ├── server/init.server.luau      # Server-side validation & coordination
│   │   └── shared/Hello.luau            # Common utilities & constants
│   ├── default.project.json             # Roblox Studio configuration
│   ├── aftman.toml                      # Development toolchain
│   └── README.md
│
├── documents/                            # Design & requirements
│   ├── Cahier des Charges — Champions Clash.md    # Product specification
│   └── Roadmap Technique — Champions Clash.md     # Technical roadmap
│
├── references/                           # Development guidelines
│   ├── patterns.md                       # Code patterns & best practices
│   ├── sharp_edges.md                    # Platform quirks & gotchas
│   └── validations.md                    # Data validation rules
│
├── AGENTS.md                             # This file
└── SKILL.md                              # Roblox development expertise reference
```

## Reference Materials

- **Product Specification**: [Cahier des Charges — Champions Clash.md](documents/Cahier%20des%20Charges%20%E2%80%94%20Champions%20Clash.md)
- **Technical Roadmap**: [Roadmap Technique — Champions Clash.md](documents/Roadmap%20Technique%20%E2%80%94%20Champions%20Clash.md)
- **Code Patterns**: [patterns.md](references/patterns.md)
- **Platform Gotchas**: [sharp_edges.md](references/sharp_edges.md)
- **Data Validation**: [validations.md](references/validations.md)
- **Roblox Development Expert**: [SKILL.md](SKILL.md)
