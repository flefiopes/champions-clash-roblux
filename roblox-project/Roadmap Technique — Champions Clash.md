# Roadmap Technique — *Champions Clash 2027*

> Développement optimisé pour publication rapide | Structuré par jalons, sans délais imposés

---

## Principes de Développement

- **Ship fast, iterate** : Publier une version jouable le plus tôt possible, même incomplète. L'engagement réel > la perfection en dev.
- **Core loop first** : Rien de secondaire tant que la boucle principale (jouer → gagner des coins → contribuer au camp) n'est pas solide.
- **Modularité** : Chaque système est développé indépendamment et branché au hub central. Un mini-jeu = un module isolé.
- **Données externes** : Toute persistance critique (scores, économie, guerres) est gérée côté backend externe, pas uniquement via Roblox DataStores. Toi (côté webapp) tu gères la BDD et l'API.

---

## Architecture Globale du Système

```
┌─────────────────────────────────────────────────────────────┐
│                        ROBLOX STUDIO                        │
│                                                             │
│  ┌──────────┐   ┌────────────┐   ┌───────────────────────┐ │
│  │  Hub     │   │ Mini-Jeux  │   │  UI / HUD / Boutique  │ │
│  │ Central  │   │ (modules)  │   │                       │ │
│  └────┬─────┘   └─────┬──────┘   └──────────┬────────────┘ │
│       │               │                     │               │
│       └───────────────┴─────────────────────┘               │
│                           │                                 │
│              HttpService (appels REST)                      │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                     BACKEND EXTERNE (toi)                   │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  REST API   │  │   Base de    │  │  Admin Dashboard   │ │
│  │  (Node/     │  │   Données    │  │  (Web)             │ │
│  │  Fastify)   │  │  (PostgreSQL │  │                    │ │
│  │             │  │  ou Supabase)│  │                    │ │
│  └──────┬──────┘  └──────────────┘  └────────────────────┘ │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │  Webhooks → Discord Bot / Notifications push         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## PHASE 0 — Fondations Techniques (Pré-développement)

> Tout ce qui doit exister **avant** d'écrire la première ligne de Lua.

### 0.1 Setup Backend Externe

**Objectif** : Une API REST opérationnelle que Roblox peut appeler via `HttpService`.

**Stack recommandée** (selon tes compétences) :

- **Runtime** : Node.js + Fastify (ou Express)
- **BDD** : PostgreSQL via **Supabase** (hosted, dashboard intégré, Row Level Security, realtime built-in)
- **ORM** : Prisma (migrations propres, typage fort)
- **Auth API** : Clé secrète partagée entre Roblox et le backend (header `X-API-Key`), régénérable depuis l'admin dashboard.
- **Hébergement** : Railway.app ou Render.com (déploiement Git-push, SSL auto, gratuit au démarrage)

**Endpoints à implémenter en Phase 0** :

```
POST   /players/login          → Crée ou récupère un joueur (userId Roblox)
GET    /players/:userId         → Profil complet (coins, gemmes, camp, rang)
POST   /players/:userId/coins   → Ajoute/retire des coins (signé côté serveur)
POST   /players/:userId/points  → Contribue des Points de Camp

GET    /wars/active             → Liste des guerres en cours + scores
GET    /wars/:warId/leaderboard → Top 100 joueurs de chaque camp

GET    /config                  → Config live du jeu (multiplicateurs, features flags)
```

**Règle de sécurité** : Roblox ne doit **jamais** être la source de vérité des transactions. Il envoie des événements signés, le backend valide et applique.

### 0.2 Schéma de Base de Données

```sql
-- Joueurs
players (
  roblox_user_id  BIGINT PRIMARY KEY,
  username        TEXT,
  coins           INTEGER DEFAULT 0,
  gems            INTEGER DEFAULT 0,
  xp              INTEGER DEFAULT 0,
  rank            TEXT DEFAULT 'recruit',
  created_at      TIMESTAMP,
  last_seen       TIMESTAMP
)

-- Factions / Camps
factions (
  id              UUID PRIMARY KEY,
  war_id          UUID REFERENCES wars(id),
  name            TEXT,
  color_hex       TEXT,
  slogan          TEXT,
  total_points    BIGINT DEFAULT 0
)

-- Guerres
wars (
  id              UUID PRIMARY KEY,
  name            TEXT,
  status          ENUM('active', 'paused', 'finished'),
  started_at      TIMESTAMP,
  ends_at         TIMESTAMP,
  reset_weekly    BOOLEAN DEFAULT TRUE
)

-- Appartenances joueur ↔ faction
player_factions (
  player_id       BIGINT REFERENCES players,
  faction_id      UUID REFERENCES factions,
  war_id          UUID REFERENCES wars,
  weekly_points   BIGINT DEFAULT 0,
  alltime_points  BIGINT DEFAULT 0,
  joined_at       TIMESTAMP,
  PRIMARY KEY (player_id, war_id)
)

-- Transactions (audit trail complet)
transactions (
  id              UUID PRIMARY KEY,
  player_id       BIGINT REFERENCES players,
  type            ENUM('coin_gain', 'coin_spend', 'gem_gain', 'gem_spend', 'point_contribution'),
  amount          INTEGER,
  source          TEXT,  -- 'minigame_race', 'shop_multiplier', etc.
  meta            JSONB, -- données contextuelles
  created_at      TIMESTAMP
)

-- Multiplicateurs actifs
active_boosts (
  id              UUID PRIMARY KEY,
  player_id       BIGINT REFERENCES players,
  type            TEXT,   -- 'point_multiplier_x2', etc.
  multiplier      FLOAT,
  expires_at      TIMESTAMP
)
```

### 0.3 Admin Dashboard (Web)

**Objectif** : Permettre de gérer guerres, factions, config du jeu sans toucher au code Roblox.

**Stack** : Next.js (ou Remix) + Supabase Auth (accès restreint à toi uniquement)

**Fonctionnalités Phase 0** :

- [ ] Créer / modifier / terminer une guerre
- [ ] Créer les factions associées (nom, couleur, slogan)
- [ ] Voir les scores en temps réel (Supabase Realtime)
- [ ] Modifier les feature flags (activer/désactiver un mini-jeu à chaud)
- [ ] Voir les logs de transactions

**Feature flags dans `/config`** :

```json
{
  "minigames": {
    "race": true,
    "combat": true,
    "idle": false,
    "quiz": false
  },
  "global_multiplier": 1.0,
  "double_points_weekend": false,
  "max_wars_per_player": 1
}
```

→ Roblox poll ce endpoint toutes les 5 minutes. Tu peux activer/désactiver des features **sans republier le jeu**.

### 0.4 Structure du Projet Roblox Studio

```
game/
├── ServerScriptService/
│   ├── Core/
│   │   ├── PlayerManager.lua       -- Login, profil, camps
│   │   ├── EconomyManager.lua      -- Coins, gems, transactions
│   │   ├── WarManager.lua          -- Guerres, scores, leaderboards
│   │   └── APIClient.lua           -- Toutes les calls HTTP vers ton backend
│   ├── Minigames/
│   │   ├── MinigameManager.lua     -- Orchestration, rotation
│   │   ├── Race/
│   │   │   └── RaceServer.lua
│   │   ├── Combat/
│   │   │   └── CombatServer.lua
│   │   └── Idle/
│   │       └── IdleServer.lua
│   └── Events/
│       └── RewardHandler.lua       -- Traite les fins de mini-jeux → récompenses
│
├── ReplicatedStorage/
│   ├── Remotes/                    -- RemoteEvents & RemoteFunctions
│   │   ├── PlayerDataUpdated
│   │   ├── StartMinigame
│   │   ├── MinigameResult
│   │   └── PurchaseRequest
│   ├── Shared/
│   │   ├── Config.lua              -- Constantes locales (UI, sons, effets)
│   │   └── Utils.lua
│   └── Assets/                    -- Modèles 3D, UI assets
│
├── StarterGui/
│   ├── HUD/                        -- Coins, Gems, Points de camp (temps réel)
│   ├── Leaderboard/
│   ├── Shop/
│   ├── FactionSelect/
│   └── MinigameUI/
│
└── StarterPlayerScripts/
    ├── UIController.lua
    └── MinigameClient.lua
```

---

## PHASE 1 — MVP Jouable (Publication Alpha)

> **Objectif** : Un joueur peut rejoindre, choisir un camp, jouer 2 mini-jeux, contribuer des points, voir le leaderboard. Rien de plus, rien de moins.

### JALON 1.1 — Système de Camp (FactionSystem)

**Implémentations requises** :

- [ ] **Écran de sélection de camp** au premier lancement
  
  - Appel `GET /wars/active` → affiche les guerres disponibles + factions
  - Choix de faction → appel `POST /players/:id/faction`
  - Le choix est persisté en BDD et rechargé à chaque connexion
  - Lock de 7 jours : le client vérifie `joined_at + 7 days > now` avant d'afficher le bouton de changement

- [ ] **HUD de camp permanent** (coin supérieur de l'écran)
  
  - Affiche : Score Camp A | Score Camp B (mis à jour toutes les 30s via polling API)
  - Couleurs dynamiques selon la faction du joueur

- [ ] **Respawn de faction** : Les joueurs spawn dans la zone de leur camp (deux zones séparées sur la map)

**Script clé — `PlayerManager.lua` (ServerScript)** :

```lua
-- À l'arrivée d'un joueur
game.Players.PlayerAdded:Connect(function(player)
  local profile = APIClient.Get("/players/" .. player.UserId)

  if not profile then
    APIClient.Post("/players/login", {
      userId = player.UserId,
      username = player.Name
    })
    profile = APIClient.Get("/players/" .. player.UserId)
  end

  -- Stocke en session (pas en DataStore — la BDD externe est la source de vérité)
  PlayerSessions[player.UserId] = profile

  -- Déclenche l'UI de sélection si pas de faction
  if not profile.factionId then
    Remotes.ShowFactionSelect:FireClient(player)
  end
end)
```

### JALON 1.2 — Mini-Jeu #1 : Course Brainrot

**Choisi en premier** car : mécanique simple, 10-20 joueurs simultanés, rejouer instantané, forte visibilité sociale.

**Mécanique** :

- 10 joueurs max par instance, 3 tours, 90 secondes max par tour
- Map : couloir d'obstacles générés procéduralement (obstacles = modèles simples repositionnés aléatoirement)
- Contrôle : WASD + Saut. Pas de compétence spéciale en Phase 1.
- Fin de manche : classement 1-10, distribution de Coins (`rank_1 = 200, rank_2 = 150, ..., rank_10 = 30`)

**Architecture serveur** :

```lua
-- RaceServer.lua
local RaceManager = {}
local MIN_PLAYERS = 4
local MAX_PLAYERS = 10
local ROUND_DURATION = 90

function RaceManager.StartMatchmaking(player)
  -- Ajoute à la queue
  -- Quand MIN_PLAYERS atteints → TeleportService vers instance de course
  -- À la fin → appel RewardHandler avec le classement
end

function RaceManager.EndRound(results)
  -- results = [{userId, rank, coinsEarned}]
  for _, result in ipairs(results) do
    RewardHandler.GrantCoins(result.userId, result.coinsEarned, "minigame_race")
  end
end
```

**Appel backend à la fin de chaque course** :

```
POST /players/:userId/coins
Body: { amount: 150, source: "minigame_race", meta: { rank: 2, gameId: "race_xyz" } }
```

### JALON 1.3 — Mini-Jeu #2 : Combat Simple (1v1)

**Choisi en second** car : fort vecteur de polarisation (camp vs camp), mécanique ultra-connue, génère des annonces serveur.

**Mécanique** :

- Matchmaking prioritaire : joueur Camp A vs joueur Camp B (sinon same camp si queue vide)
- 3 rounds, premier à 2 victoires gagne
- Système de combat : 3 moves (Attaque / Défense / Spécial) — résolution Pierre-Papier-Ciseaux avec animations
  - Attaque bat Spécial, Défense bat Attaque, Spécial bat Défense
  - Chaque move a un cooldown de 2s (évite le spam)
- HP : 100 pts. Attaque = -20, Spécial = -35 mais se recharge en 5s, Défense = 0 dmg reçu

**Annonce serveur** (Roblox `MessagingService` ou simple chat event) :

```
⚔️ [ROUGE] Joueur_X a battu [BLEU] Joueur_Y en combat !
```

**Récompenses** :

- Vainqueur : 300 Coins + 50 Points de Camp
- Perdant : 50 Coins (participation)

### JALON 1.4 — Système de Contribution de Points

**Mécanique** :

- Les Coins servent à acheter des Points de Camp à un taux fixe : `100 Coins = 10 Points`
- Interface : Bouton "Soutenir mon camp" dans le HUD → slider de montant → confirmation
- Call backend : `POST /players/:userId/points` avec validation du solde côté serveur

**Script `EconomyManager.lua`** :

```lua
function EconomyManager.ContributePoints(player, coinsAmount)
  local session = PlayerSessions[player.UserId]

  -- Validation locale avant appel API
  if session.coins < coinsAmount then
    return false, "Coins insuffisants"
  end

  local response = APIClient.Post("/players/" .. player.UserId .. "/points", {
    coinsSpent = coinsAmount,
    factionId = session.factionId,
    warId = session.activeWarId
  })

  if response.success then
    session.coins = response.newBalance
    Remotes.PlayerDataUpdated:FireClient(player, { coins = session.coins })
    return true
  end
end
```

### JALON 1.5 — Leaderboard en Temps Réel

**Objectif** : Panneau physique dans le hub + leaderboard in-game mis à jour automatiquement.

**Stratégie de mise à jour** :

- Roblox poll `GET /wars/:warId/leaderboard` toutes les **30 secondes** (ne pas spammer)
- Supabase Realtime (WebSocket) sur la table `player_factions` → webhook vers ton backend → endpoint `/leaderboard/push` → Roblox reçoit via DataStore ou polling accéléré

**Affichage** :

- Top 20 joueurs par camp (prénom Roblox + Points contribués cette semaine)
- Score total des deux camps (grand compteur animé)
- Rang du joueur connecté mis en avant ("Tu es #47 dans ton camp")

### JALON 1.6 — Reset Hebdomadaire Automatique

**Côté backend (cron job)** :

```
CRON : Tous les lundis à 00h00 UTC
→ Snapshot les scores finaux dans une table `war_weekly_results`
→ Reset la colonne `weekly_points` dans `player_factions`
→ Incrémente le compteur de victoires du camp gagnant
→ Déclenche webhook Discord → annonce du gagnant
→ Met à jour le flag `war.last_reset_at`
```

**Côté Roblox** :

- Au login suivant le reset, le serveur détecte que `last_seen < last_reset_at` → affiche une animation "Nouvelle semaine, nouvelle guerre !"
- Les scores du leaderboard repartent à 0 automatiquement (source de vérité = BDD)

---

## PHASE 2 — Enrichissement du Core Loop

> Le jeu est publié. On enrichit pour augmenter la rétention et ajouter les premiers leviers de monétisation.

### JALON 2.1 — Mini-Jeu #3 : Idle Builder (Passif)

**Objectif** : Générer des raisons de revenir quotidiennement même sans jouer.

**Mécanique** :

- Chaque joueur a une "base" qui produit des Coins passivement
- Taux de base : 10 Coins / minute (plafonné à 8h de production offline)
- Améliorations achetables (Coins) : Générateur Niv.1 (100C/min), Niv.2 (250C/min), etc.
- **Stocké côté backend** : `last_collection_at` + `production_rate` → calcul serveur du montant à collecter

**Appel de collecte** :

```
POST /players/:userId/idle/collect
→ Server calcule : min((now - last_collection_at) * rate, MAX_OFFLINE_COINS)
→ Crédite les coins, met à jour last_collection_at
→ Retourne { collected: 4200, nextMaxAt: "8h" }
```

**UI** : Bouton "Collecter" avec compteur animé. Badge rouge sur le bouton quand la collecte est disponible.

### JALON 2.2 — Mini-Jeu #4 : Quiz de Faction

**Objectif** : Mini-jeu solo rapide, zéro infrastructure serveur, intégrable en quelques heures.

**Mécanique** :

- 10 questions en 60 secondes, thème absurde/fictif lié à l'univers du jeu
- Questions stockées dans un `ModuleScript` Roblox (pas besoin d'API pour MVP)
- En Phase 3 : questions servies par l'API (pool de 200+ questions rotatif)
- Score : 100 Coins par bonne réponse, bonus 500 Coins si 10/10

**Pool de questions (exemple)** :

```lua
local Questions = {
  {
    q = "Quel est le cri de guerre officiel des Champions Rouges ?",
    answers = {"ROUGE TOUJOURS!", "Vive les Bleus", "Paix partout", "..."},
    correct = 1
  },
  -- etc.
}
```

**Points importants** :

- 3 quiz max par jour par joueur (évite le farming)
- Compteur côté backend : `GET /players/:userId/daily-limits` → `{ quiz: { used: 2, max: 3 } }`

### JALON 2.3 — Système de Quêtes Journalières

**Stockage** : Table `daily_quests` côté backend, générée chaque jour par un cron.

```sql
daily_quests (
  id          UUID PRIMARY KEY,
  player_id   BIGINT,
  date        DATE,
  quest_type  TEXT,     -- 'play_races', 'contribute_points', 'win_combats'
  target      INTEGER,  -- ex: 3
  progress    INTEGER DEFAULT 0,
  completed   BOOLEAN DEFAULT FALSE,
  reward_coins INTEGER
)
```

**Types de quêtes Phase 2** :

| ID                  | Description             | Cible | Récompense |
| ------------------- | ----------------------- | ----- | ---------- |
| `play_races`        | Jouer X courses         | 3     | 500 Coins  |
| `contribute_points` | Contribuer X Points     | 1000  | 300 Coins  |
| `win_combats`       | Gagner X combats        | 2     | 600 Coins  |
| `collect_idle`      | Collecter sa production | 1     | 200 Coins  |
| `daily_login`       | Se connecter            | 1     | 100 Coins  |

**Mise à jour** : À chaque action en jeu, Roblox appelle `PATCH /quests/:questId/progress` → le backend incrémente et vérifie la complétion.

### JALON 2.4 — Boutique & Premier Achat Robux

**Produits Phase 2 (les plus simples à implémenter)** :

- **Multiplicateur x2 Points (1h)** — `MarketplaceService:PromptProductPurchase()`
- **Pack de Gemmes Starter (100 gemmes)**
- **Reset de faction anticipé**

**Flow d'achat Roblox** :

```lua
-- ProcessReceipt (ServerScript, exécuté UNE FOIS garanti par Roblox)
MarketplaceService.ProcessReceipt = function(receiptInfo)
  local response = APIClient.Post("/purchases/process", {
    userId = receiptInfo.PlayerId,
    productId = receiptInfo.ProductId,
    purchaseId = receiptInfo.PurchaseId  -- idempotency key
  })

  if response.success then
    return Enum.ProductPurchaseDecision.PurchaseGranted
  else
    return Enum.ProductPurchaseDecision.NotProcessedYet
  end
end
```

**Côté backend** :

```
POST /purchases/process
→ Vérifie que purchaseId n'a pas déjà été traité (idempotence)
→ Crédite gems/boost selon productId
→ Log dans transactions
→ Retourne { success: true, newBalance: {...} }
```

**Table produits** (gérée depuis l'Admin Dashboard) :

```sql
products (
  roblox_product_id  INTEGER PRIMARY KEY,
  type               TEXT,   -- 'gems', 'boost', 'cosmetic'
  value              JSONB,  -- { gems: 100 } ou { boost: "x2", duration: 3600 }
  is_active          BOOLEAN
)
```

### JALON 2.5 — Annonces Sociales & Ego

**Implémentations** :

- [ ] **Chat serveur automatique** : Quand un joueur contribue > 5 000 Points d'un coup → annonce dans le chat global
  
  ```
  🔥 [ROUGE] PlayerX vient de donner 5 000 Points à son camp !
  ```

- [ ] **Notification de dépassement de rang** : Quand un joueur dépasse un autre au leaderboard → notification in-game locale
  
  ```
  📈 Tu viens de passer devant PlayerY ! Tu es maintenant #12 de ton camp.
  ```

- [ ] **Affichage du score adverse** : Le HUD montre toujours l'écart avec le camp adverse en rouge/vert. Psychologiquement fort.

---

## PHASE 3 — Engagement Avancé & Monétisation Complète

> Le jeu a des joueurs actifs. On maximise la rétention long terme et on optimise les revenus.

### JALON 3.1 — Mini-Jeu #5 : Platformer Speedrun

**Mécanique** :

- Niveaux courts (60-90s max), style obby Roblox
- 5 niveaux en rotation hebdomadaire (swappés par l'admin via feature flag)
- Temps de complétion → classement mondial permanent par niveau
- Récompenses : Coins selon le rang dans le classement, badge "Record du Niveau" si top 3

**Stockage des temps** :

```
POST /minigames/platformer/submit
Body: { userId, levelId, timeMs, replayHash }
→ Valide que timeMs est physiquement possible (anti-cheat basique)
→ Insère dans leaderboard_platformer
→ Retourne { rank, personalBest, topTime }
```

### JALON 3.2 — Battle Pass Saisonnier

**Structure** :

- 30 paliers de récompenses cosmétiques (pas de pay-to-win)
- XP gagné via toutes les actions du jeu
- Paliers gratuits (tous les 5) vs paliers premium (achat Battle Pass en Robux)

**Backend** :

```sql
battle_pass_progress (
  player_id     BIGINT,
  season_id     UUID,
  xp            INTEGER DEFAULT 0,
  tier          INTEGER DEFAULT 0,   -- calculé automatiquement
  is_premium    BOOLEAN DEFAULT FALSE,
  purchased_at  TIMESTAMP
)
```

**Calcul du tier** : `tier = floor(xp / XP_PER_TIER)` — géré côté backend, jamais côté client.

### JALON 3.3 — Notifications Push via Discord Bot

**Objectif** : Réengager les joueurs entre les sessions via Discord (plus simple que Roblox notifications).

**Architecture** :

```
Backend Cron (toutes les heures)
  → Vérifie les conditions de notification (score serré, fin de semaine proche...)
  → Appelle Discord Bot API → poste dans le serveur Discord du jeu
  → Message : "@everyone ⚠️ Le Camp Bleu mène de seulement 200 points !
               Il reste 6h avant le reset — connectez-vous !"
```

**Conditions de notification automatique** :

- Écart de score < 5% entre les deux camps → "Guerre ultra-serrée !"
- 12h avant reset si le camp du bot est en train de perdre
- Fin de semaine (vendredi 18h) → "Weekend de Points, connectez-vous !"
- Nouveau record battu sur un mini-jeu

**Stack Discord Bot** : discord.js (Node.js) — même runtime que ton API, déploie sur le même service.

### JALON 3.4 — Système de Multiplicateurs Dynamiques

**Multiplicateurs gérés en BDD** :

```sql
global_events (
  id            UUID PRIMARY KEY,
  type          TEXT,    -- 'double_points', 'triple_coins', 'bonus_week'
  multiplier    FLOAT,
  applies_to    TEXT,    -- 'all', 'faction:uuid', 'minigame:race'
  started_at    TIMESTAMP,
  ends_at       TIMESTAMP,
  created_by    TEXT     -- admin username
)
```

- L'endpoint `/config` retourne les multiplicateurs actifs
- Roblox les applique localement dans les calculs de récompenses
- Validation finale côté backend au moment de la transaction

### JALON 3.5 — Deuxième Guerre Simultanée

**Changements nécessaires** :

- [ ] UI : Écran de sélection affiche maintenant 2 guerres actives, le joueur peut rejoindre 1 (ou 2 avec Premium)
- [ ] HUD : Mini-tabs pour switcher entre les scores des deux guerres actives
- [ ] Backend : `player_factions` supporte déjà plusieurs lignes par joueur (clé `(player_id, war_id)`)
- [ ] Matchmaking Course/Combat : Priorité aux matchs inter-camps **de la même guerre**

---

## PHASE 4 — Live Ops & Optimisation

> Le jeu tourne. On itère sur les données pour maximiser engagement et revenue.

### JALON 4.1 — Analytics Dashboard

**Métriques à tracker dans la BDD** :

```sql
analytics_events (
  id          UUID,
  player_id   BIGINT,
  event       TEXT,    -- 'session_start', 'minigame_played', 'shop_open', 'purchase'
  meta        JSONB,
  created_at  TIMESTAMP
)
```

**KPIs à monitorer** :

- Sessions / jour, durée moyenne
- Funnel de conversion : joue → contribue des points → ouvre la boutique → achète
- Taux de rétention J1/J7/J30 (calculé sur `last_seen` vs `created_at`)
- Revenue by product (quel item se vend le mieux)
- Quel mini-jeu est joué le plus / génère le plus de coins dépensés ensuite

**Outil** : Supbase a un dashboard SQL intégré. Pour du vrai analytics, pipe vers **Metabase** (self-hosted, gratuit) connecté à ta PostgreSQL.

### JALON 4.2 — Anti-Cheat Côté Serveur

**Validations à implémenter** :

- Toutes les transactions de Coins/Points validées côté backend (jamais basées sur ce que dit le client)
- Rate limiting sur les endpoints de récompenses (max 1 appel de `coin_gain` toutes les 3s par joueur)
- Vérification de cohérence : Si un joueur envoie "j'ai gagné 50 000 coins en 1 course" → reject + log
- Replay hash sur le platformer speedrun (hash de la séquence d'inputs) → invalidable si suspicion

**Middleware API** :

```javascript
// Chaque requête depuis Roblox inclut un header X-API-Key + X-Server-Id
// Le middleware vérifie la clé ET que le server_id est un serveur Roblox légitime
app.use(async (req, res, next) => {
  const key = req.headers['x-api-key']
  const serverId = req.headers['x-server-id']
  if (key !== process.env.ROBLOX_API_KEY) return res.status(401).json({ error: 'unauthorized' })
  next()
})
```

### JALON 4.3 — Système de Saisons Automatisé

**Cron de fin de saison** :

```
CRON : Selon war.ends_at
  1. Snapshot final de tous les scores
  2. Calcul du champion de chaque rang
  3. Attribution des cosmétiques de saison aux top joueurs (via API Roblox)
  4. Archive la guerre (status = 'finished')
  5. Crée automatiquement la guerre suivante (selon config admin)
  6. Annonce Discord + notification in-game au prochain login
```

---

## Récapitulatif des Outils Externes

| Outil            | Usage                                 | Tier Gratuit              |
| ---------------- | ------------------------------------- | ------------------------- |
| **Supabase**     | BDD PostgreSQL, Auth admin, Realtime  | Oui (500MB, 2GB transfer) |
| **Railway.app**  | Hébergement API Node.js + Bot Discord | Oui (500h/mois)           |
| **Render.com**   | Alternative Railway, toujours-on      | Oui (avec spin-down)      |
| **Prisma**       | ORM + migrations BDD                  | Open source               |
| **discord.js**   | Bot Discord pour notifications        | Open source               |
| **Metabase**     | Analytics dashboard SQL               | Open source, self-host    |
| **Roblox DevEx** | Conversion Robux → argent réel        | Selon éligibilité         |

---

## Ordre de Priorité Absolu (Récap)

```
PHASE 0 : Backend + BDD + Admin Dashboard + Structure Roblox
    ↓
JALON 1.1 : Système de camp + écran de sélection
    ↓
JALON 1.2 : Mini-jeu Course (le plus visible)
    ↓
JALON 1.3 : Mini-jeu Combat (polarisation camp vs camp)
    ↓
JALON 1.4 : Contribution de Points de Camp (le core loop est complet)
    ↓
JALON 1.5 : Leaderboard
    ↓
JALON 1.6 : Reset hebdomadaire automatique
    ↓
⭐ PUBLICATION ALPHA ⭐
    ↓
JALON 2.1 : Idle Builder (rétention quotidienne)
    ↓
JALON 2.4 : Boutique + Premier achat Robux
    ↓
JALON 2.3 : Quêtes journalières
    ↓
JALON 2.2 : Quiz (mini-jeu solo rapide)
    ↓
JALON 2.5 : Annonces sociales / ego
    ↓
⭐ PUBLICATION BETA ⭐
    ↓
PHASE 3 → PHASE 4 selon les données d'usage
```

---

*Roadmap v1.0 — Mai 2026*
