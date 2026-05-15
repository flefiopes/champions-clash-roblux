# Champions Clash — Backend API Reference

> **Target audience**: Roblox Lua developers integrating with the Champions Clash backend.  
> **Base URL**: `https://<your-domain>/api/v1`  
> **All responses** follow the envelope format described in [Response Format](#response-format).

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Codes](#error-codes)
4. [Rate Limits](#rate-limits)
5. [Endpoints](#endpoints)
   - [Config](#config)
   - [Health](#health)
   - [Players](#players)
   - [Wars](#wars)
   - [Mini-games](#mini-games)
   - [Purchases](#purchases)
6. [Data Shapes](#data-shapes)
7. [Polling Recommendations](#polling-recommendations)
8. [Lua Integration Notes](#lua-integration-notes)

---

## Authentication

All endpoints except `GET /config` and `GET /health*` require two HTTP headers:

| Header | Value | Required |
|---|---|---|
| `X-API-Key` | Shared secret (`ROBLOX_API_KEY` env var) | **Yes** — on all protected routes |
| `X-Server-Id` | Roblox `game.JobId` (UUID string) | No — but recommended for audit logs |
| `Content-Type` | `application/json` | Yes — on all POST requests |

Missing or wrong `X-API-Key` → **HTTP 401**.

```lua
-- Lua helper: build standard headers
local function getHeaders()
    return {
        ["X-API-Key"]    = API_KEY,          -- store in a Script/ModuleScript constant
        ["X-Server-Id"]  = game.JobId,
        ["Content-Type"] = "application/json",
    }
end
```

> **Security**: Never hardcode `API_KEY` in a LocalScript. Keep it in a server-side ModuleScript or retrieve it via a server-side BindableFunction.

---

## Response Format

Every endpoint returns a JSON object with the following envelope:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Failure
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }   // omitted in production
  }
}
```

In Lua, always check `response.success` before reading `response.data`.

```lua
local function parseResponse(rawJson)
    local ok, result = pcall(function()
        return HttpService:JSONDecode(rawJson)
    end)
    if not ok or not result.success then
        warn("[API] Error:", result and result.error and result.error.message or rawJson)
        return nil
    end
    return result.data
end
```

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid `X-API-Key` |
| `VALIDATION_ERROR` | 400 | Request body or params failed schema validation |
| `PLAYER_NOT_FOUND` | 404 | No player with that `robloxId` exists yet (call `/login` first) |
| `WAR_NOT_FOUND` | 404 | Unknown `warId` UUID |
| `FACTION_NOT_FOUND` | 404 | Faction does not exist or does not belong to the war |
| `FACTION_LOCK_ACTIVE` | 409 | Player cannot switch faction yet (7-day lock). `details.lockExpiresAt` is an ISO 8601 date |
| `INSUFFICIENT_COINS` | 400 | Player balance too low. `details.required` and `details.current` are provided |
| `INVALID_FACTION` | 400 | Player is not a member of this faction |
| `INVALID_ACTION` | 400 | Quest not completed or already claimed |
| `NOT_FOUND` | 404 | Generic resource not found |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## Rate Limits

Rate limiting is enforced per player via Redis sliding-window counters. Exceeding a limit returns **HTTP 429**.

| Action | Default limit | Window |
|---|---|---|
| Coin gain (`POST /players/:id/coins`) | 20 requests | 60 s |
| Point contribution (`POST /players/:id/points`) | 30 requests | 60 s |
| Purchase processing (`POST /purchases/process`) | 10 requests | 60 s |

These defaults can be changed via environment variables (`RATE_LIMIT_COIN_GAIN_MAX`, etc.) without redeploying.

---

## Endpoints

---

### Config

#### `GET /config`

Returns the live game configuration. **No authentication required.**  
Cached in Redis for 60 seconds. Poll every **5 minutes** from each server instance.

**Response `data`**

```json
{
  "minigames": {
    "race":      { "enabled": true,  "max_reward": 300 },
    "combat":    { "enabled": true,  "max_reward": 500 },
    "idle":      { "enabled": false, "max_reward": 100 },
    "quiz":      { "enabled": false, "max_reward": 200 },
    "platformer":{ "enabled": false, "max_reward": 400 }
  },
  "globalMultiplier":    1.0,
  "doublePointsWeekend": false,
  "maxWarsPerPlayer":    1,
  "coinToPointRate":     10
}
```

| Field | Type | Description |
|---|---|---|
| `minigames` | object | Per mini-game flags and reward caps |
| `minigames[id].enabled` | boolean | Whether the mini-game accepts results |
| `minigames[id].max_reward` | number | Hard coin cap per session |
| `globalMultiplier` | number | Multiplier applied to all coin rewards |
| `doublePointsWeekend` | boolean | Whether double-point event is active |
| `maxWarsPerPlayer` | number | Max simultaneous war participations |
| `coinToPointRate` | number | Coins needed per faction point (currently 100 coins = 10 pts) |

---

### Health

#### `GET /health`

Basic liveness check. Returns 200 if the server process is running. No auth required.

```json
{ "success": true, "data": { "status": "ok", "timestamp": "...", "uptime": 1234.5 } }
```

#### `GET /health/ready`

Readiness check. Verifies database and Redis connectivity. Returns **503** if any dependency is unhealthy.

```json
{
  "success": true,
  "data": { "healthy": true, "timestamp": "...", "db": "ok", "redis": "ok" }
}
```

---

### Players

All player endpoints require `X-API-Key`.

---

#### `POST /players/login`

**Call on every player join.** Creates the player if new, otherwise updates their username and `last_seen`. Also assigns fresh daily quests if none exist for today.

**Request body**

```json
{
  "roblox_user_id": 123456789,
  "username": "PlayerName"
}
```

| Field | Type | Constraints |
|---|---|---|
| `roblox_user_id` | integer | Positive. Use `Players:GetUserIdFromNameAsync` or `player.UserId` |
| `username` | string | 1–100 chars. Use `player.DisplayName` |

**Response `data`** → [PlayerProfile](#playerprofile)

```lua
-- Call in a server Script when a player joins
local function onPlayerJoin(player)
    local body = HttpService:JSONEncode({
        roblox_user_id = player.UserId,
        username       = player.DisplayName,
    })
    local res = HttpService:RequestAsync({
        Url     = BASE_URL .. "/players/login",
        Method  = "POST",
        Headers = getHeaders(),
        Body    = body,
    })
    local profile = parseResponse(res.Body)
    -- cache profile locally for the session
end
```

---

#### `GET /players/:robloxId`

Returns the full player profile.  
`:robloxId` = Roblox `UserId` (integer).

**Response `data`** → [PlayerProfile](#playerprofile)

---

#### `GET /players/:robloxId/daily-limits`

Returns today's usage for rate-limited actions.

**Response `data`**

```json
{
  "quiz":        { "used": 1, "max": 3 },
  "idleCollect": { "used": 0, "max": 1 }
}
```

> **Note**: As of Phase 1, `used` always returns `0`. Real counters arrive in Phase 2.

---

#### `POST /players/:robloxId/coins`

Awards coins after a validated in-game action (mini-game win, daily login bonus, etc.).  
**Do not call this for mini-game results** — use `POST /minigames/result` instead.

**Request body**

```json
{
  "amount": 150,
  "source": "daily_login",
  "meta":   { "streak": 5 }
}
```

| Field | Type | Constraints |
|---|---|---|
| `amount` | integer | 1–10 000 (hard cap per single action) |
| `source` | string | 1–100 chars. Machine-readable tag (e.g. `"quiz_bonus"`, `"daily_login"`) |
| `meta` | object | Optional. Any key-value pairs for the transaction audit log |

**Response `data`**

```json
{ "newCoinBalance": 1350 }
```

---

#### `POST /players/:robloxId/points`

Converts the player's coins into faction points. This is the **core economy loop**.

- Deducts `coins_spent` from the player's balance (atomic — fails if balance is insufficient).
- Formula: `points_awarded = floor(coins_spent / 100) * 10`
- Player **must already be a member** of `faction_id` in `war_id` (join via `/faction` first).

**Request body**

```json
{
  "coins_spent": 1000,
  "faction_id":  "uuid-of-faction",
  "war_id":      "uuid-of-war"
}
```

| Field | Type | Constraints |
|---|---|---|
| `coins_spent` | integer | Positive |
| `faction_id` | string (UUID) | Must belong to `war_id` |
| `war_id` | string (UUID) | Must be an active war |

**Response `data`**

```json
{
  "newCoinBalance": 200,
  "pointsAwarded":  100
}
```

**Errors**: `INSUFFICIENT_COINS`, `INVALID_FACTION`

---

#### `POST /players/:robloxId/faction`

Joins a faction within a war.

- If the player has **no existing membership** in this war → joins immediately.
- If the player **already has a membership** and the 7-day lock has expired → switches faction (weekly points reset to 0).
- If the **lock is still active** → returns `FACTION_LOCK_ACTIVE` (409) with `details.lockExpiresAt`.

**Request body**

```json
{
  "faction_id": "uuid-of-faction",
  "war_id":     "uuid-of-war"
}
```

**Response `data`**

```json
{ "joined": true }
```

---

#### `GET /players/:robloxId/boosts`

Returns all active multiplier boosts for the player.

**Response `data`**

```json
[
  {
    "id":         "boost-uuid",
    "type":       "coin_multiplier",
    "multiplier": 2.0,
    "expiresAt":  "2026-05-16T00:00:00.000Z"
  }
]
```

Apply `multiplier` locally to coin earnings. Check `expiresAt` against `os.time()` to discard expired boosts.

---

#### `GET /players/:robloxId/quests`

Returns all quests currently assigned to the player (active, completed, and claimed).

**Response `data`** → array of [PlayerQuest](#playerquest)

---

#### `POST /players/:robloxId/quests/:questId/claim`

Claims rewards for a quest whose `status` is `"completed"`. Idempotent — claiming twice returns `INVALID_ACTION`.

`:questId` = the `questId` UUID from the quest list.

**Response `data`**

```json
{
  "coins": 500,
  "gems":  0,
  "xp":    250
}
```

---

#### `GET /players/:robloxId/badges`

Returns the player's full badge collection.

**Response `data`** → array of [Badge](#badge)

---

#### `POST /players/:robloxId/idle/collect`

Collects accumulated idle coins since the last collection.

- Accumulation rate: `baseRate × luckBonus` coins/hour, capped at **24 hours**.
- `baseRate` is read from admin config (`idleCoinBaseRate`, default `100`).
- `luckBonus = 1 + luckLevel × 0.1`.

**Response `data`**

```json
{
  "awarded":    240,
  "newBalance": 1240
}
```

> Call this when the player opens the idle menu, not automatically on join.

---

#### `POST /players/:robloxId/upgrade`

Purchases an attribute upgrade using coins.

**Cost curve** (coins per level):

| Level | Cost |
|---|---|
| 0 → 1 | 200 |
| 1 → 2 | 400 |
| 2 → 3 | 800 |
| 3 → 4 | 1 500 |
| 4 → 5 | 3 000 |
| 5 → 6 | 6 000 |
| 6 → 7 | 12 000 |
| 7 → 8 | 24 000 |
| 8 → 9 | 48 000 |
| 9 → 10 | 96 000 |

**Request body**

```json
{ "attribute": "force" }
```

| Field | Type | Values |
|---|---|---|
| `attribute` | string (enum) | `"force"` · `"speed"` · `"luck"` |

**Response `data`**

```json
{
  "newLevel":   3,
  "newBalance": 7200
}
```

**Errors**: `INSUFFICIENT_COINS`

---

### Wars

All war endpoints require `X-API-Key`.

---

#### `GET /wars/active`

Returns all active wars with their factions and live scores. Cached in Redis for **60 seconds**.  
Poll every **30 seconds** for the faction selection screen and HUD score bar.

**Response `data`** → array of [ActiveWar](#activewar)

```json
[
  {
    "id":          "war-uuid",
    "name":        "Season 1",
    "status":      "active",
    "resetWeekly": true,
    "lastResetAt": "2026-05-12T00:00:00.000Z",
    "endsAt":      null,
    "factions": [
      {
        "id":               "faction-uuid",
        "warId":            "war-uuid",
        "name":             "Red Wolves",
        "colorHex":         "#FF4444",
        "slogan":           "Never back down",
        "totalPoints":      42500,
        "memberCount":      87,
        "dynamicMultiplier":1.0,
        "isBotAssisted":    false
      }
    ]
  }
]
```

**Rubber-banding flags**:
- `dynamicMultiplier > 1.0` → apply this multiplier to point contributions for trailing factions server-side (the backend already applies it; this flag is informational for visual effects).
- `isBotAssisted: true` → spawn support NPCs for this faction.

---

#### `GET /wars/:warId/leaderboard?limit=100`

Returns the top-N players per faction for the specified war. Cached for **5 minutes**.

| Query param | Type | Default | Max |
|---|---|---|---|
| `limit` | integer | 100 | 200 |

**Response `data`** → [WarLeaderboard](#warleaderboard)

```json
{
  "warId":   "war-uuid",
  "warName": "Season 1",
  "factions": [
    {
      "factionId":   "faction-uuid",
      "factionName": "Red Wolves",
      "entries": [
        {
          "rank":         1,
          "playerId":     "internal-uuid",
          "robloxUserId": 123456789,
          "username":     "PlayerName",
          "weeklyPoints": 3200,
          "alltimePoints":12000,
          "playerRank":   "veteran"
        }
      ]
    }
  ]
}
```

---

### Mini-games

Requires `X-API-Key`.

---

#### `POST /minigames/result`

Reports a mini-game completion. Awards coins and XP based on rank or raw score.  
The mini-game must be enabled in `/config` — the server validates this before granting rewards.

**Request body**

```json
{
  "roblox_user_id": 123456789,
  "minigame_id":    "race",
  "rank":           1,
  "score":          null
}
```

| Field | Type | Constraints |
|---|---|---|
| `roblox_user_id` | integer | Positive |
| `minigame_id` | string | Must match a key in `/config`.`minigames` |
| `rank` | integer | 1–100, optional |
| `score` | number | Optional. Used when `rank` is absent |

**Reward calculation**:
- If `rank` is provided and `rank ≤ 10`: uses the rank table below.
- If only `score` is provided: `baseCoins = floor(score / 10)`.
- Final: `coinsAwarded = floor(baseCoins × globalMultiplier)`, capped at `max_reward`.
- XP: `xpAwarded = floor(coinsAwarded × 0.5)`.

**Rank → base coin table**:

| Rank | Base coins |
|---|---|
| 1 | 200 |
| 2 | 150 |
| 3 | 120 |
| 4 | 100 |
| 5 | 80 |
| 6 | 70 |
| 7 | 60 |
| 8 | 50 |
| 9 | 40 |
| 10 | 30 |

**Response `data`**

```json
{
  "coinsAwarded":  200,
  "xpAwarded":     100,
  "newCoinBalance":1550
}
```

---

### Purchases

Requires `X-API-Key`.

---

#### `POST /purchases/process`

Processes a Roblox `MarketplaceService` developer product purchase. **Idempotent** — submitting the same `purchase_id` twice returns a success without re-granting the reward.

Call this inside your `ProcessReceipt` callback on the server side.

**Request body**

```json
{
  "roblox_user_id":    123456789,
  "roblox_product_id": 987654321,
  "purchase_id":       "roblox-receipt-id-string"
}
```

| Field | Type | Description |
|---|---|---|
| `roblox_user_id` | integer | Buyer's Roblox UserId |
| `roblox_product_id` | integer | Roblox Developer Product ID |
| `purchase_id` | string | Roblox receipt ID (idempotency key, max 100 chars) |

**Response `data`**

```json
{
  "success":          true,
  "alreadyProcessed": false,
  "newGemBalance":    250
}
```

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Always `true` on 200 |
| `alreadyProcessed` | boolean | `true` if this receipt was already handled |
| `newGemBalance` | integer | Present only for gem purchases |

```lua
-- MarketplaceService.ProcessReceipt callback
MarketplaceService.ProcessReceipt = function(receiptInfo)
    local body = HttpService:JSONEncode({
        roblox_user_id    = receiptInfo.PlayerId,
        roblox_product_id = receiptInfo.ProductId,
        purchase_id       = tostring(receiptInfo.PurchaseId),
    })
    local res = HttpService:RequestAsync({
        Url     = BASE_URL .. "/purchases/process",
        Method  = "POST",
        Headers = getHeaders(),
        Body    = body,
    })
    local data = parseResponse(res.Body)
    if data then
        return Enum.ProductPurchaseDecision.PurchaseGranted
    end
    return Enum.ProductPurchaseDecision.NotProcessedYet
end
```

---

## Data Shapes

### PlayerProfile

```
id               string (UUID)   Internal player identifier
robloxUserId     number          Roblox UserId
username         string          Roblox DisplayName at last login
coins            number          Current coin balance
gems             number          Current gem balance
xp               number          Total XP accumulated
rank             string          See PlayerRank
level            number          Computed from XP: floor(sqrt(xp/100)) + 1
nextLevelXp      number          XP needed to reach next level
loginStreak      number          Consecutive daily login count
lastSeen         string|null     ISO 8601 timestamp
forceLevel       number          0–N (upgrade tier)
speedLevel       number          0–N
luckLevel        number          0–N (affects idle rate)
prestigeLevel    number          0–N
avgSessionHour   number|null     Weighted average login hour (0–23)
idleLastCollectedAt string|null  ISO 8601 timestamp of last idle collect
createdAt        string          ISO 8601 account creation timestamp
factions         PlayerFactionSummary[]
```

### PlayerRank (progression order)

`recruit` → `militant` → `activist` → `veteran` → `elite` → `champion` → `legend`

### PlayerFactionSummary

```
factionId    string (UUID)
factionName  string
warId        string (UUID)
warName      string
weeklyPoints number   Resets every Monday
alltimePoints number  Never resets
joinedAt     string   ISO 8601
```

### ActiveWar

```
id           string (UUID)
name         string
status       "active" | "paused" | "finished"
resetWeekly  boolean
lastResetAt  string|null   ISO 8601
endsAt       string|null   ISO 8601, null = no end date
factions     FactionScore[]
```

### FactionScore

```
id                string (UUID)
warId             string (UUID)
name              string
colorHex          string   e.g. "#FF4444"
slogan            string
totalPoints       number
memberCount       number
dynamicMultiplier number   1.0 = normal, >1.0 = trailing bonus active
isBotAssisted     boolean  true = spawn support NPCs
```

### WarLeaderboard

```
warId    string (UUID)
warName  string
factions array of:
  factionId   string (UUID)
  factionName string
  entries     LeaderboardEntry[]
```

### LeaderboardEntry

```
rank         number
playerId     string (UUID)   internal
robloxUserId number
username     string
weeklyPoints number
alltimePoints number
playerRank   string   PlayerRank value
```

### PlayerQuest

```
questId          string (UUID)
title            string
description      string
type             "daily" | "recruit" | "seasonal" | "secret"
status           "active" | "completed" | "claimed"
requirementType  string   e.g. "coins_earned", "games_played", "points_contributed"
requirementValue number   Target value to complete
currentValue     number   Current progress
rewardCoins      number
rewardGems       number
rewardXp         number
rewardBadgeId    string|null
assignedAt       string   ISO 8601
```

### Badge

```
id          string (UUID)
slug        string   Internal unique identifier
name        string
description string
imageUrl    string
rarity      "common" | "rare" | "epic" | "legendary" | "secret"
isPermanent boolean
```

---

## Polling Recommendations

| Data | Endpoint | Recommended interval |
|---|---|---|
| Game config | `GET /config` | Every 5 minutes per server |
| Active wars & scores | `GET /wars/active` | Every 30 seconds |
| War leaderboard | `GET /wars/:id/leaderboard` | Every 30 seconds |
| Player profile | `GET /players/:id` | On join + on demand |
| Player boosts | `GET /players/:id/boosts` | On join, then every 60 s |
| Player quests | `GET /players/:id/quests` | On join + after each action |

---

## Lua Integration Notes

### Suggested call sequence on player join

```lua
-- 1. POST /players/login  → get full profile (coins, gems, xp, rank, factions)
-- 2. GET  /config         → load active mini-games and multipliers
-- 3. GET  /wars/active    → display faction selection screen
-- 4. GET  /players/:id/boosts   → apply active multipliers
-- 5. GET  /players/:id/quests   → populate quest UI
```

### UUID handling

All faction and war IDs are **UUID v4 strings** (e.g. `"550e8400-e29b-41d4-a716-446655440000"`). Store them as Lua strings and send them back verbatim. Never coerce to a number.

### ISO 8601 dates

Dates are returned as strings (`"2026-05-15T23:00:00.000Z"`). To compare with the current time in Lua:

```lua
-- Simple comparison using os.time() and a RFC 3339 parser is needed.
-- Alternatively, store the raw string and send it back to the server unchanged.
```

### Handling 429 Too Many Requests

```lua
if res.StatusCode == 429 then
    task.wait(5)  -- back off and retry
end
```

### Recommended server architecture

```
ServerScript (per server)
  └── ModuleScript: ApiClient        -- all HttpService calls, shared headers
        ├── ModuleScript: PlayerApi  -- login, profile, coins, points, faction
        ├── ModuleScript: WarApi     -- active wars, leaderboard
        ├── ModuleScript: GameApi    -- minigame result, config
        └── ModuleScript: ShopApi    -- purchase processing
```

Keep `API_KEY` only in server-side scripts (`Script`, not `LocalScript`).

---

*Generated from backend source — `backend-app/src` — 15 May 2026.*
