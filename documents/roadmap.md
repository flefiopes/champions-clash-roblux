# Roadmap Technique — Champions Clash 2027
> Structurée par jalons de priorité décroissante. Aucune date limite imposée.
> Chaque jalon est un état stable et jouable du jeu. On ne passe au suivant que lorsque le précédent est solide.

---

## Principes Directeurs

Le développement suit une logique de core loop first : aucune feature secondaire n'est construite tant que la boucle centrale (jouer, gagner des coins, contribuer au camp, voir l'impact) n'est pas validée en conditions réelles. Chaque jalon produit une version publiable, même minimale. L'itération sur données réelles prime sur la perfection en développement.

La source de vérité de toutes les transactions économiques et de tous les scores est le backend externe. Roblox est un client qui propose des actions. Le serveur valide et applique.

---

## Jalon 0 — Fondations Backend et Structure Roblox

Tout ce qui doit exister avant d'écrire la première ligne de code Lua côté jeu.

### Backend (sous ta responsabilité)

Mise en place de l'API REST que Roblox appelle via HttpService. Stack en place : Bun, ElysiaJS, Drizzle ORM, MySQL, Redis pour le cache du leaderboard.

Endpoints minimaux à opérationnaliser :

```
POST  /players/login               Création ou récupération d'un joueur par userId Roblox
GET   /players/:id                 Profil complet : coins, gemmes, faction, rang
POST  /players/:id/coins           Ajout ou retrait de coins, validé serveur
POST  /players/:id/points          Contribution de Points de Camp
GET   /wars/active                 Guerres en cours avec scores des deux camps
GET   /wars/:id/leaderboard        Top 100 joueurs par faction
GET   /config                      Feature flags et multiplicateurs actifs en live
```

Authentification : header X-API-Key sur toutes les requêtes Roblox. Header X-Admin-Key distinct pour le dashboard admin. Rate limiting sur les endpoints de gain (1 appel de coin_gain toutes les 3 secondes par joueur maximum).

Schéma de base de données minimal opérationnel : tables players, factions, wars, player_factions, transactions, active_boosts.

Cron job de reset hebdomadaire configuré : snapshot des scores finaux, remise à zéro de weekly_points, détermination du camp gagnant, déclenchement de la notification Discord.

Dashboard admin minimal : création et clôture d'une guerre, attribution des factions, visualisation des scores en temps réel, modification des feature flags à chaud.

### Structure du Projet Roblox Studio

Organisation modulaire des scripts avant tout développement de gameplay :

```
ServerScriptService/
  Core/
    PlayerManager         Login, session, gestion de profil
    EconomyManager        Coins, gemmes, validation des transactions
    WarManager            Scores de guerre, leaderboard, polling API
    APIClient             Centralise tous les appels HTTP vers le backend
  Minigames/
    MinigameManager       Orchestration, rotation, lancement des instances
  Events/
    RewardHandler         Calcul et distribution des récompenses post-mini-jeu

ReplicatedStorage/
  Remotes/                RemoteEvents et RemoteFunctions (PlayerDataUpdated, StartMinigame, MinigameResult, PurchaseRequest)
  Shared/                 Config locale, constantes, utilitaires partagés

StarterGui/
  HUD/                    Affichage coins, gemmes, score de camp en temps réel
  Leaderboard/
  FactionSelect/
```

---

## Jalon 1 — Core Loop Jouable (Publication Alpha)

Objectif : un joueur peut rejoindre, choisir un camp, jouer, contribuer des points et voir l'impact sur le leaderboard. Rien d'autre.

### 1.1 Système de Factions

- Écran de sélection de camp au premier lancement, présentant les deux factions avec leurs scores en cours et une asymétrie délibérée (une faction affichée légèrement dominante).
- Appel POST /players/:id/faction à la sélection. Le choix est persisté en base, verrouillé 7 jours.
- Spawn dans la zone physique de sa faction sur la map. Les deux zones sont visuellement distinctes et séparées.
- HUD permanent affichant le score des deux camps, mis à jour par polling de l'API toutes les 30 secondes.

### 1.2 Tunnel de Première Expérience (Onboarding Scripté)

Conformément au plan de rétention, la première session est entièrement guidée :

1. Arrivée sur une map avec une guerre visuellement en cours (scores qui bougent, joueurs actifs visibles). Le joueur voit le monde fonctionner sans lui.
2. Sélection de camp.
3. Accès forcé au premier mini-jeu (la Course), peuplé de bots calibrés pour que le joueur finisse 1er ou 2ème. Récompense x3 à l'issue.
4. Popup de contribution immédiate : le joueur convertit ses premiers coins en Points de Camp et voit le score de sa faction augmenter.

Ce tunnel ne doit comporter aucun menu libre, aucun choix superflu. La séquence est linéaire et non contournable.

### 1.3 Mini-jeu 1 : La Course

Premier mini-jeu développé pour sa visibilité sociale maximale (10 joueurs dans la même instance, résultat immédiatement lisible).

- Instances séparées de 10 joueurs maximum, matchmaking simple par disponibilité.
- Obstacles générés procéduralement à partir d'un pool de modèles repositionnés (pas de génération complexe).
- Durée : 90 secondes maximum par manche. Trois manches par session de jeu.
- Distribution de coins en fin de manche selon le rang : rang 1 = 200 coins, rang 10 = 30 coins.
- Bots complétant les instances si le nombre de joueurs humains est insuffisant. Niveau des bots calibré dynamiquement selon le taux de victoire récent du joueur (Rubber Band System, invisible).
- Annonce dans le chat serveur à chaque fin de manche : "Camp [X] remporte la course."

### 1.4 Mini-jeu 2 : Le Combat

Développé en second pour sa valeur de polarisation directe (camp contre camp en face à face).

- Matchmaking prioritaire inter-camps : un joueur du Camp A est mis en face d'un joueur du Camp B en priorité.
- Mécanique de résolution : trois actions disponibles (Attaque, Défense, Spécial) sur le principe pierre-papier-ciseaux étendu. Chaque action a un cooldown de 2 secondes.
- Trois rounds, premier à 2 victoires gagne. Points de vie : 100. Attaque retire 20 HP, Spécial retire 35 HP mais se recharge en 5 secondes, Défense annule les dégâts du round.
- Récompenses : vainqueur = 300 coins + 50 Points de Camp. Perdant = 50 coins.
- Annonce serveur à chaque victoire inter-camps : "Camp [X] : Joueur Y a battu Joueur Z du Camp adverse."

### 1.5 Système de Contribution de Points de Camp

- Taux de conversion fixe : 100 coins = 10 Points de Camp.
- Interface : bouton "Soutenir mon camp" dans le HUD, slider de montant, confirmation.
- Validation du solde côté serveur avant application. Le client ne met à jour son affichage qu'après confirmation de l'API.
- Le score de la faction visible dans le HUD est mis à jour dans les 30 secondes suivant toute contribution.

### 1.6 Leaderboard

- Tableau physique dans le hub central, mis à jour via polling API toutes les 30 secondes.
- Affichage : top 20 joueurs par camp avec Points contribués cette semaine.
- Score total des deux camps en grand format, toujours visible.
- Le rang personnel du joueur connecté est affiché même s'il n'est pas dans le top 20 ("Tu es 84ème dans ton camp").

### 1.7 Reset Hebdomadaire Automatique

- Cron backend déclenché chaque lundi à minuit UTC.
- Séquence : snapshot des scores finaux en table d'archive, remise à zéro de weekly_points, incrémentation du compteur de victoires du camp gagnant, déclenchement de la notification Discord, mise à jour du flag last_reset_at.
- À la prochaine connexion d'un joueur après le reset, affichage d'un écran "Nouvelle semaine, nouvelle guerre" avec le score actuel à 0-0.

Point de publication : le jeu est jouable, le core loop est complet. On publie en alpha et on mesure le comportement réel avant de construire la suite.

---

## Jalon 2 — Rétention Quotidienne et Première Monétisation

Objectif : créer des raisons de revenir chaque jour et introduire les premiers leviers de revenus.

### 2.1 Streak de Connexion et Missions d'Initiation

Streak de connexion quotidien avec récompenses croissantes sur 7 jours. Le badge du 7ème jour est permanent et visible sur le profil public.

Cinq "Défis d'Initiation" (jamais appelés tutoriels) débloqués progressivement sur les premiers jours, couvrant chaque système du jeu (jouer une course, contribuer des points, gagner un combat, se connecter 3 jours de suite, atteindre le Rang 2).

### 2.2 Courbe d'XP et Système de Rangs

Courbe d'XP à progression rapide sur J1-J7 (montées de niveau fréquentes, feedback visuel à chaque montée) qui ralentit progressivement sans que le joueur ne le perçoive comme une rupture.

Sept rangs de Recrue à Légende, basés sur les Points de Camp contribués en cumul. Chaque rang débloque un élément visible par les autres joueurs : bordure de profil, badge, titre dans le chat, effet d'entrée, accès à la Zone Elite, nom sur le Hall of Fame.

Régression de rang après 14 jours d'inactivité, avec notification à J10 d'inactivité ("Tu perds ton rang dans 4 jours").

### 2.3 Idle Builder

Chaque joueur dispose d'une base qui produit des coins passivement, plafonnée à 8 heures de production hors-connexion. Le calcul est entièrement serveur : last_collection_at + production_rate, validé à chaque collecte via POST /players/:id/idle/collect.

Améliorations achetables en coins pour augmenter le taux de production. Badge rouge sur le bouton de collecte dès que la production est disponible.

Cet élément est le premier vecteur de connexion quotidienne courte (moins de 2 minutes). Il maintient l'habitude même en dehors des sessions longues.

### 2.4 Quêtes Journalières

Trois quêtes renouvelées à minuit. Chacune prend 2 à 5 minutes. Elles sont complétables en une session de transport.

Types de quêtes : jouer X courses, contribuer X Points, gagner X combats, collecter sa production Idle, se connecter. Progression trackée en base via PATCH /quests/:id/progress à chaque action.

Quêtes hebdomadaires en parallèle, renouvelées au reset du lundi : objectifs plus ambitieux, récompenses plus importantes.

### 2.5 Premier Niveau de Monétisation

Intégration MarketplaceService avec ProcessReceipt idempotent (purchaseId comme clé d'idempotence côté backend).

Trois produits initiaux uniquement :
- Multiplicateur x2 sur les Points de Camp pendant 1 heure.
- Multiplicateur x3 pendant 24 heures.
- Pack de Gemmes Starter.

Les multiplicateurs sont visibles par les coéquipiers dans le chat de camp ("Joueur X joue en mode x2"). Cette visibilité sociale crée une pression d'achat organique.

Les moments de déclenchement de l'achat sont codés explicitement dans le flux de jeu : écran post-défaite serrée, notification de classement à une place du seuil, compte à rebours de fin de semaine.

### 2.6 Mécanique d'Annonces Sociales

Annonce dans le chat serveur visible par tous quand un joueur contribue plus de 5 000 Points en une session.
Notification locale personnalisée quand le joueur dépasse un rival au leaderboard.
HUD affichant en permanence l'écart en Points avec le camp adverse, en rouge si en retard, en vert si en avance.

---

## Jalon 3 — Profondeur Compétitive et Engagement Saisonnier

Objectif : prolonger la rétention au-delà de J30 par des systèmes de profondeur progressive.

### 3.1 Rival Personnel

À partir du Rang 3 (Activiste), le système assigne automatiquement un Rival : un joueur du camp adverse avec un niveau de Points similaire (écart de 10% maximum).

Le rival est affiché dans le HUD. Chaque contribution de sa part déclenche une notification discrète. Si le rival dépasse le joueur, une notification spécifique est envoyée. L'objectif est de personnaliser la guerre collective en une compétition individuelle parallèle.

Le rival peut être changé en dépensant des coins. Un défi formel accepté rend la confrontation visible pour les membres des deux camps.

### 3.2 Deuxième Guerre Simultanée

Activation de la deuxième guerre parallèle dans le panneau admin. Les joueurs peuvent participer à une guerre par défaut, deux avec le Pass Premium.

Le HUD intègre des onglets de navigation entre les scores des deux guerres actives. Le matchmaking en Combat donne la priorité aux joueurs de la même guerre.

### 3.3 Mini-jeu 3 : Platformer Speedrun

Niveaux courts (60 à 90 secondes maximum). Cinq niveaux en rotation hebdomadaire, définis par l'admin via feature flag.

Temps de complétion soumis à l'API via POST /minigames/platformer/submit avec validation de cohérence serveur (temps physiquement impossible = rejet). Leaderboard permanent par niveau. Badge "Record du Niveau" pour le top 3.

### 3.4 Équilibrage Dynamique des Guerres

Si un camp dépasse 65% des Points à mi-semaine : boost silencieux de +15% sur les contributions du camp perdant, notifications ciblées, quêtes journalières à +20% de récompenses pour ce camp.

Si un camp perd trois semaines consécutives : événement narratif "Le Retournement", Points x2 pour le camp perdant pendant 48 heures. Présenté comme un événement de jeu, jamais comme un rééquilibrage mécanique.

### 3.5 Structure Saisonnière et Battle Pass

Chaque saison dure 4 à 6 semaines. Elle introduit un nouveau thème de guerre, un nouveau mini-jeu ou variante, et un Battle Pass saisonnier de 30 paliers.

Les cosmétiques saisonniers sont retirés définitivement à la fin de chaque saison. Cette exclusivité permanente crée une culture de collection et une urgence réelle.

Cron de fin de saison : snapshot final, attribution des cosmétiques aux top joueurs, archivage de la guerre, création automatique de la guerre suivante selon la configuration admin, teaser de la prochaine saison.

---

## Jalon 4 — Systèmes de Profondeur Long Terme (Post J60)

Objectif : retenir les joueurs qui dépassent deux mois de jeu.

### 4.1 Alliances

Sous-groupes de 5 à 20 joueurs au sein d'une même faction. Chat privé, classement des alliances dans chaque camp, objectif collectif hebdomadaire.

Le lien social entre joueurs d'une même alliance est le facteur de rétention le plus puissant du jeu. Un joueur avec une alliance active a un taux de rétention J30 deux à trois fois supérieur à un joueur solo.

### 4.2 Prestige

Un joueur ayant atteint le Rang 7 (Légende) peut réinitialiser son rang volontairement en échange de récompenses permanentes et visibles : badge doré, boost permanent de gains, effet visuel sur le personnage, inscription définitive dans la salle des trophées.

Le Prestige est limité à une activation par saison. Il ancre le système dans le cycle saisonnier et empêche les abus.

### 4.3 Quêtes Secrètes

Couche de quêtes non annoncées, déclenchées par des comportements spécifiques (jouer exactement à minuit le jour du reset, perdre 10 combats consécutifs sans quitter, contribuer exactement 2 027 Points en une session). Récompenses cosmétiques exclusives uniquement.

Ces quêtes créent une culture de découverte communautaire et génèrent du contenu externe (guides, vidéos) sans coût de développement supplémentaire.

### 4.4 Mini-jeu 4 : Quiz de Faction

Dix questions en 60 secondes, pool de 200 questions tournant hebdomadairement, thème fictif et absurde lié à l'univers des camps. Limité à 3 sessions par jour par joueur. Limite trackée côté backend.

---

## Jalon 5 — Live Operations et Optimisation Continue

Objectif : exploiter les données réelles pour maximiser engagement et revenus.

### 5.1 Événements Flash Récurrents

Double Points Weekend deux fois par mois (vendredi 18h au dimanche 23h59), annoncé 48 heures à l'avance. Pic d'activité garanti et pic de monétisation correspondant.

Invasion de Camp une fois par mois sur 48 heures : les victoires en Combat valent x3 les Points habituels pour le camp qui lance l'invasion.

Boss de Fin de Saison sur 72 heures : ennemi commun aux deux camps, victoire par accumulation de dégâts collectifs. Si l'objectif n'est pas atteint dans le temps imparti, tout le monde perd les récompenses. La menace collective génère une mobilisation organique.

### 5.2 Notifications Comportementales

Intégration d'un calcul d'heure moyenne de connexion par joueur (moyenne glissante sur 7 jours stockée en base). Les notifications critiques sont envoyées dans la fenêtre habituelle de connexion du joueur, pas à une heure universelle.

Trois niveaux d'urgence définis : urgence immédiate (1 maximum par jour), rappel motivant (1 tous les 2 jours), information et anticipation (2 par semaine). Jamais plus d'une notification par jour par joueur tous niveaux confondus.

### 5.3 Analytics et Pilotage par les Données

Logguer tous les événements significatifs dans une table analytics_events (session_start, minigame_played, shop_open, purchase, contribution, quest_completed). Stocker le contexte dans un champ JSON.

Métriques à suivre en priorité : funnel de conversion jouer/contribuer/boutique/achat, taux de rétention J1-J7-J30, revenu par produit, mini-jeu le plus joué et celui qui génère le plus de dépenses dans les 10 minutes suivantes, écart moyen entre les deux camps en fin de semaine.

Décisions de gameplay et de balance prises sur ces données, pas sur des intuitions.

---

## Récapitulatif des Jalons

| Jalon | Contenu central | Etat du jeu à l'issue |
|---|---|---|
| 0 | Backend, BDD, admin dashboard, structure Roblox | Infrastructure opérationnelle |
| 1 | Factions, onboarding scripté, Course, Combat, contribution, leaderboard, reset | Alpha publiable |
| 2 | Streak, rangs, idle, quêtes, monétisation initiale, annonces sociales | Beta publiable |
| 3 | Rival, 2ème guerre, Platformer, équilibrage dynamique, saisons, Battle Pass | Version 1.0 complète |
| 4 | Alliances, Prestige, quêtes secrètes, Quiz | Version long terme |
| 5 | Événements flash, notifications comportementales, analytics | Live operations continue |

---

*Roadmap v2.0 — Mai 2026 — Usage interne*