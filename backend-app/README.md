# Champions Clash — Backend API

Le backend officiel du jeu Roblox **Champions Clash**.
Construit avec **Bun**, **ElysiaJS**, **Drizzle ORM** (MySQL) et **Redis** pour gérer l'économie, la sécurité, et le système de compétition en temps réel entre factions.

---

## 🏗️ Architecture & Fonctionnement

Le backend agit comme la source de vérité pour la persistance des données et la validation de la logique métier. Il est divisé en deux grandes parties :

1. **API Publique (Roblox) :** Sécurisée par `ROBLOX_API_KEY`. Utilisée par les serveurs de jeu Roblox via `HttpService` pour lire et écrire les données des joueurs.
2. **API Admin (Dashboard) :** Sécurisée par `ADMIN_API_KEY`. Utilisée pour le back-office web afin de piloter les guerres, configurer la boutique et ajuster les statistiques.

### Entités Principales
- **Factions & Guerres :** Les joueurs rejoignent un camp pour une saison ("War"). Le système bloque le changement de camp pendant 7 jours.
- **Économie & Transactions :** Les gains de `coins` et les dépenses en `points de faction` ou `gems` sont vérifiés côté serveur. Un registre de transactions immuable permet de garantir l'absence d'exploits (farming, duplication).
- **Abonnements & Boutique :** Les reçus de `MarketplaceService` (Roblox) sont traités de manière idempotente pour éviter de créditer un achat deux fois en cas de lag réseau.
- **Game Config :** Variables de jeu "Hot-Reloadables" (ex: multiplicateur global d'XP) stockées en DB et mises en cache sur Redis pour une lecture ultra-rapide par les serveurs Roblox.

### Crons & Workers (Tâches planifiées)
- **Weekly War Reset :** Chaque Lundi à 00:00 UTC, la guerre est réinitialisée. Les scores de la semaine sont gelés ("snapshot"), le camp vainqueur est déclaré, et une notification Discord est envoyée.
- **Expire Boosts :** Nettoie toutes les 5 minutes les multiplicateurs de joueurs arrivés à expiration.

---

## 🚀 Guide de Développement (Local)

Pour travailler sur ce projet sans conflit avec Windows ou WSL2, la configuration Docker a été optimisée avec le système **Docker Compose Watch**.

### 1. Prérequis
- Docker Desktop lancé
- Copier `.env.example` en `.env` (les identifiants par défaut sont déjà bons pour le dev local).

### 2. Lancer l'environnement de Dev (Hot Reload)

Afin d'avoir le rechargement automatique du code ET les logs en temps réel, il est recommandé d'utiliser **deux terminaux séparés**.

**Terminal 1 : Lancer le Watcher (Hot Reload)**
Nettoie toujours les conteneurs précédents, puis lance le Watcher natif Docker :
```bash
docker compose -f docker-compose.development.yml down -v
docker compose -f docker-compose.development.yml watch
```
*Le watcher va tourner indéfiniment. À chaque sauvegarde de fichier (ex: Ctrl+S), Docker copie le fichier dans le conteneur et redémarre instantanément le processus Bun.*

**Terminal 2 : Afficher les Logs**
Ouvre un second onglet de terminal pour lire les logs de l'API en direct :
```bash
docker compose -f docker-compose.development.yml logs -f api-dev
```

### 3. Commandes Utiles (Hors Docker)
Si tu souhaites exécuter des commandes locales (assure-toi d'avoir installé `bun` sur ta machine Windows/Linux) :
```bash
# Formater le code
bun format

# Vérifier les erreurs TypeScript
bun typecheck

# Lancer le Linter
bun lint:fix

### 4. Base de données & Migrations
Les migrations (application du schéma SQL) et l'injection de données par défaut (Seeding) **se lancent automatiquement** à chaque démarrage du conteneur API.

Cependant, lorsque tu modifies un fichier dans `src/db/schema/`, tu dois **générer manuellement** la nouvelle migration :

Si tu as Bun installé localement :
```bash
bun run db:generate
```

Si tu n'as rien installé sur ton PC, utilise Docker (pendant que l'environnement tourne) :
```bash
docker exec -it champions-clash-api-dev bun run db:generate
```
```

---

## 🗂️ Structure des Routes

Toutes les routes sont préfixées par `/api/v1/`.

### 🛡️ Routes Roblox (Nécessite le Header `X-API-Key`)
- `POST /players/login` : Connecte ou enregistre un joueur.
- `GET /players/:robloxId` : Récupère le profil (solde, faction actuelle, etc.).
- `POST /players/:robloxId/coins` : Valide un gain d'argent (avec Rate-Limiting restrictif).
- `POST /players/:robloxId/points` : Convertit les coins en points pour la guerre.
- `POST /players/:robloxId/faction` : Rejoint une faction.
- `GET /wars/active` : Récupère la saison actuelle et les scores totaux.
- `GET /wars/:warId/leaderboard` : Récupère le Top 100 des contributeurs.
- `POST /purchases/process` : Valide un paiement Roblox en argent réel (Idempotent).

### ⚙️ Routes Admin (Nécessite le Header `X-Admin-Key`)
- `GET /admin/transactions` : Historique comptable global.
- `POST /admin/wars` & `PUT /admin/wars/:id` : Crée/Edite les saisons.
- `POST /admin/factions` & `PUT /admin/factions/:id` : Crée/Edite les camps.
- `POST /admin/products` & `PUT /admin/products/:id` : Modifie le catalogue boutique.
- `PUT /admin/config` : Met à jour les Feature Flags du jeu sans redémarrage.

### 🌐 Routes Publiques
- `GET /config` : Lit la configuration actuelle du jeu (Mis en cache Redis, pas d'Auth).
- `GET /health` & `GET /health/ready` : Vérification du statut de l'API et des BDD.
