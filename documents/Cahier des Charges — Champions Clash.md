# Cahier des Charges — *Champions Clash 2027*

> Jeu Roblox compétitif à camps polarisés | Document de conception v1.0

---

## 1. Vision & Positionnement

### 1.1 Concept Central

**Champions Clash 2027** est un jeu Roblox de compétition sociale à deux (ou plusieurs) camps polarisés, dont les thématiques sont inspirées d'événements culturels et politiques réels — élections, rivalités sportives, phénomènes de société — sans jamais les reproduire explicitement.

L'engagement repose sur **l'identité de camp** : le joueur ne joue pas pour lui seul, il joue *pour son clan*. Chaque point gagné en mini-jeu contribue à la victoire collective de sa faction. Cette mécanique de tribu génère naturellement une polarisation émotionnelle forte, moteur principal de la rétention et du bouche-à-oreille.

### 1.2 Noms envisagés

| Option                   | Tonalité                         |
| ------------------------ | -------------------------------- |
| **Champions Clash 2027** | Compétitif, neutre, universel    |
| **Voter Fort**           | Clin d'œil politique, accrocheur |
| **Candidats Champion**   | Direct, légèrement provocateur   |
| **Choisis Ton Camp**     | Communautaire, inclusif          |

> 🎯 **Recommandation** : *Champions Clash* pour la longévité du branding, avec un sous-titre thématique qui change chaque saison (ex : *"Saison Élections"*, *"Saison Classico"*).

### 1.3 Tonalité & Univers Graphique

- **Style visuel** : Cartoon exagéré, couleurs saturées, iconographie de bande dessinée politique/sportive.
- **Personnages** : Des "Champions" archétypaux et caricaturaux (le tribun, l'oligarque, le peuple, le star du foot...) jamais nominalement identifiés à des personnes réelles.
- **Ambiance sonore** : Electro-pop energique, ambiances de stade, jingles de campagne fictifs.
- **Charte graphique** : Chaque camp possède ses propres couleurs, logo et musique de faction. Exemple : Camp Rouge vs Camp Bleu, Camp Paris vs Camp Marseille.

---

## 2. Mécanique de Camp & Polarisation

### 2.1 Choix de Camp à l'Entrée

À leur première connexion, les joueurs sont accueillis par un **écran de sélection de camp** dramatisé :

- Animation cinématique courte présentant les deux factions en conflit.
- Chaque camp dispose d'un **slogan**, d'un **compte de membres en direct** et d'un **score de guerre en cours**.
- Le joueur choisit son camp. Ce choix est **verrouillé pour la semaine** (possibilité de changement payant ou via un cooldown de 7 jours).

> 💡 **Bonne pratique Roblox** : Afficher la taille actuelle de chaque équipe crée une asymétrie perçue qui pousse les joueurs à rejoindre le camp "perdant" pour "redresser la balance" — ce qui nourrit la compétition.

### 2.2 Guerres Multiples Simultanées

Le jeu gère **plusieurs "Guerres" en parallèle**, chacune avec ses propres camps, thèmes et compteurs :

| Guerre            | Camp A         | Camp B             | Thématique            |
| ----------------- | -------------- | ------------------ | --------------------- |
| Guerre Politique  | Les Rouges     | Les Bleus          | Élection fictive 2027 |
| Guerre Sportive   | Les Parisiens  | Les Méditerranéens | Rivalité de clubs     |
| Guerre Culturelle | Les Classiques | Les Modernes       | Art & Pop culture     |

- Un joueur peut participer à **1 à 2 guerres simultanément** (déblocable via abonnement premium).
- Chaque guerre a son propre **leaderboard**, ses propres **récompenses** et son propre **cycle de reset**.

### 2.3 Cycle de Reset Hebdomadaire

- **Tous les lundis à minuit**, les scores de guerre hebdomadaires sont remis à zéro.
- Les scores **généraux (all-time)** sont conservés dans un tableau distinct et alimentent le prestige à long terme.
- La semaine se termine par une **cérémonie de victoire** animée pour le camp gagnant (cutscene + notification push).
- Le camp gagnant reçoit des **bonus passifs** pour la semaine suivante (multiplicateurs légèrement augmentés).

> 🔁 **Boucle de rétention** : Le reset hebdomadaire crée une urgence cyclique. Les joueurs reviennent car leur camp "ne peut pas perdre cette semaine". Identique au système de saisons de Fortnite ou de wars dans Clash of Clans.

### 2.4 Gestion des Thèmes par l'Admin

- Un **panneau d'administration** permet de créer, modifier et archiver des guerres en quelques clics.
- L'admin définit : nom des camps, couleurs, slogan, durée de la guerre, type de récompenses associées.
- Les guerres peuvent être **programmées à l'avance** pour coïncider avec des événements calendaires (élections réelles, matchs, fêtes nationales...).
- Chaque guerre peut avoir une **durée personnalisée** : 1 semaine, 1 mois, ou "permanente" (prestige).

---

## 3. Système d'Économie du Jeu

### 3.1 Les Deux Monnaies

| Monnaie          | Nom suggéré     | Rôle                                                    |
| ---------------- | --------------- | ------------------------------------------------------- |
| **Monnaie Soft** | Voix / Coins    | Gagnée en jeu, utilisée pour acheter des Points de Camp |
| **Monnaie Hard** | Gemmes / Tokens | Achetable en Robux, donne des avantages compétitifs     |

### 3.2 Flux Économique Principal

```
Mini-jeux & Actions → Coins (Voix)
                          ↓
              Achat de Points de Camp
                          ↓
              Score de ta Faction augmente
                          ↓
              Classement Guerre & Leaderboard
```

- Les **Coins** sont gagnés en jouant aux mini-jeux, en complétant des quêtes, en se connectant quotidiennement.
- Les **Points de Camp** s'achètent avec les Coins, mais également avec des Gemmes (à un meilleur taux).
- Il n'est **jamais possible d'acheter directement** des Points de Camp avec des Robux : on achète des Gemmes, qui permettent d'en acheter plus efficacement. (Conformité Roblox + psychologie du prix indirect.)

### 3.3 Boutique de Progression

Les Coins et Gemmes permettent d'acheter :

- **Améliorations de personnage** : Force, Vitesse, Chance — augmentent les gains dans les mini-jeux.
- **Points de Camp boostés** : Échanges plus favorables Coins → Points.
- **Objets cosmétiques de faction** : Tenues, accessoires, effets visuels aux couleurs de son camp.
- **Consommables** : Potions de XP temporaires, boucliers anti-malus, boost de gains pour 1h.

---

## 4. Mini-Jeux — Le Cœur de l'Engagement

### 4.1 Philosophie de Design

Chaque mini-jeu doit respecter les **3 règles d'or du mobile/Roblox** :

1. **Compréhensible en 3 secondes** (one-button concept ou mécanique ultra-familière).
2. **Session de moins de 2 minutes** (frustration si trop long, satisfaction rapide).
3. **Rejouer en un clic** (boucle de rejeu immédiate).

### 4.2 Catalogue de Mini-Jeux

#### 🏃 Course Brainrot

- Course de personnages avec obstacles absurdes et aléatoires, style "Stumble Guys" simplifié.
- Le joueur le plus rapide gagne des Coins selon son rang.
- **Bonus de camp** : Si ton camp remporte 60% des courses dans la journée → bonus de Points de Camp.

#### ⚔️ Combat de Champions

- Combat 1v1 ou 3v3 entre représentants des camps opposés.
- Système de pierre-papier-ciseaux évolué avec des compétences déblocables.
- **Mécanique ego** : Les victoires contre le camp adverse sont annoncées dans le chat du serveur avec animation.

#### 🏗️ Idle Builder

- Chaque joueur construit passivement la "capitale" de son camp (usines, monuments, QG...).
- Les bâtiments produisent des Coins en temps réel, même hors connexion (limité sans premium).
- Revenir pour collecter = habitude quotidienne garantie.

#### 🎯 Jeu de Tir / Lancers

- Mini-jeu de lancer de projectiles (bulletins de vote, ballons, etc.) sur des cibles ennemies.
- Multiplicateur de score si chaîne de cibles touchées.
- Mode "Invasion" où le camp adverse envoie des vagues de cibles.

#### 🧩 Plateforme & Parkour

- Niveaux courts de plateforme aux couleurs de chaque faction.
- Temps de complétion → Classement → Coins + bonus si record battu.
- **Saisonnalité** : Nouveaux niveaux chaque semaine pour maintenir l'intérêt.

#### 🎰 Roue de la Fortune du Camp

- Spin quotidien gratuit (1/jour), spins supplémentaires achetables.
- Récompenses : Coins, Gemmes, cosmétiques, multiplicateurs temporaires.
- **Streak bonus** : 7 jours de connexion consécutifs → spin premium garanti.

#### 🧠 Quiz de Faction

- Questions de culture générale thématisées autour de l'univers des camps (fictif, absurde, jamais réellement politique).
- Bonne réponse = Coins. Meilleure série = Gemmes.
- Résultats partagés dans le leaderboard du camp.

### 4.3 Rotation & Exclusivité

- **Mini-jeux rotatifs** : 2-3 mini-jeux changent chaque semaine pour maintenir la nouveauté.
- **Mini-jeux exclusifs de guerre** : Disponibles uniquement pendant une guerre spécifique.
- **Mini-jeux premium** : Accessibles uniquement aux abonnés ou aux acheteurs de packs.

---

## 5. Systèmes de Rétention Joueur

### 5.1 Boucle Quotidienne (Daily Loop)

| Moment    | Action                       | Récompense                    |
| --------- | ---------------------------- | ----------------------------- |
| Connexion | Login quotidien              | Coins + progression de streak |
| 5 min     | Collecter la production Idle | Coins passifs                 |
| 10 min    | Compléter 2-3 mini-jeux      | Coins + XP + Points de Camp   |
| 20 min    | Quête journalière            | Récompense spéciale           |
| Optionnel | PvP / Guerres actives        | Classement + fierté de camp   |

### 5.2 Quêtes & Missions

**Quêtes Journalières** (se renouvellent toutes les 24h) :

- "Gagne 3 courses pour ton camp"
- "Dépense 500 Coins en Points de Camp"
- "Bats 5 joueurs du camp adverse"

**Quêtes Hebdomadaires** (se renouvellent au reset) :

- "Contribue 5 000 Points de Camp cette semaine"
- "Joue à 10 mini-jeux différents"
- "Connecte-toi 5 jours cette semaine"

**Quêtes de Saison** (sur la durée d'une guerre) :

- "Atteins le top 100 de ta faction"
- "Fais gagner ton camp 2 semaines de suite"
- "Débloque le rang 'Champion de Camp'"

### 5.3 Système de Rangs & Prestige

Chaque joueur possède un **rang individuel** au sein de son camp, progressant avec les Points contribués :

```
Recrue → Militant → Activiste → Vétéran → Élite → Champion → Légende
```

- Chaque rang débloque des **cosmétiques exclusifs** (badge, bordure de profil, effet de victoire).
- Les joueurs de rang élevé sont mis en avant dans le **leaderboard de camp**.
- La **régression de rang** est possible si inactivité prolongée → urgence de jouer.

### 5.4 Mécaniques Sociales & Ego

> **Principe fondamental** : Le joueur doit *sentir* que son camp a besoin de lui et que ses ennemis le voient.

- **Annonces de serveur** : "JOUEUR_X vient de marquer 10 000 Points pour les [ROUGE] !" → visible par tous.
- **Messages de défi** : Possibilité d'envoyer un défi officiel à un joueur du camp adverse (génère une notification).
- **Hall of Fame** : Les 3 meilleurs contributeurs de chaque camp cette semaine apparaissent sur un podium à l'entrée de la map.
- **Flammes de rivalité** : Compteur visible du nombre de confrontations Camp A vs Camp B depuis le début du jeu.
- **Ratio de victoires** : Affiché publiquement sur le profil de chaque joueur.

### 5.5 Notifications & Réengagement

- **Notification push** (via Roblox) : "Ton camp est en train de perdre ! Il manque 2 000 points pour reprendre la tête."
- **Notification de reset imminent** : "Plus que 6 heures avant le reset — ton camp est à -500 points !"
- **Notification de défi** : "JOUEUR_Y du Camp Bleu t'a défié en combat !"
- **Notification de streak** : "Tu es à 6 jours de streak — ne perds pas ton bonus !"

---

## 6. Monétisation (Robux)

### 6.1 Philosophie de Monétisation

Le modèle repose sur le **Compelled Spending** : les joueurs ne sont jamais forcés de payer, mais chaque achat doit sembler **indispensable à leur camp**. L'achat est socialisé — "j'achète pour mes coéquipiers, pas pour moi."

### 6.2 Offres Payantes

#### 🚀 Multiplicateurs de Points (Core Revenue)

- **x2 Points de Camp** pendant 1h : 50 Robux
- **x3 Points de Camp** pendant 24h : 150 Robux
- **x5 Points de Camp** — Pack Semaine : 400 Robux
- **Multiplicateur Permanent x1.5** : 800 Robux (once)

> Ces multiplicateurs sont le **premier levier de monétisation** à pousser. Ils sont visibles par les coéquipiers ("JOUEUR_X joue en mode x5 !"), créant une pression sociale à l'achat.

#### 💎 Packs de Gemmes

| Pack      | Gemmes            | Prix Robux | Valeur perçue       |
| --------- | ----------------- | ---------- | ------------------- |
| Starter   | 100               | 80         | Découverte          |
| Popular ⭐ | 550               | 350        | Best-seller affiché |
| Champion  | 1 200             | 650        | Gros joueurs        |
| Légende   | 2 500 + 500 bonus | 1 200      | Baleines            |

#### 👑 Abonnement Premium (Battle Pass)

- **7 Robux/semaine** ou **25 Robux/mois**
- Avantages : +1 guerre simultanée, spin quotidien premium, production Idle x2, badge exclusif, accès aux mini-jeux premium, cosmétiques de saison.

#### 🎨 Cosmétiques de Camp

- Tenues exclusives de faction : 50-200 Robux
- Effets de victoire (animations spéciales) : 100-300 Robux
- Titres et badges rares : 75-150 Robux
- **Important** : Cosmétiques sans impact sur le gameplay → confort de la communauté Roblox.

#### ⚡ Accélérateurs & Consommables

- Potion XP x2 (1h) : 30 Robux
- Reset de camp immédiat (changer de faction sans attendre) : 100 Robux
- Bouclier anti-malus (24h) : 40 Robux
- "Bombe de Points" : Contribue instantanément 5 000 Points à ton camp : 200 Robux

### 6.3 Déclencheurs d'Achat

Les achats sont déclenchés par des **moments émotionnels précis** :

- Écran de défaite ("Ton camp a perdu de 300 points — achète un boost pour la semaine prochaine")
- Classement serré ("Tu es 11ème — il te faut 500 Points pour entrer dans le Top 10")
- Fin de semaine imminente ("Il reste 2h — ton camp peut encore gagner avec un x5")
- Nouveau rival ("JOUEUR_Y vient de te dépasser au classement")

### 6.4 Conformité Roblox

- Pas de loot boxes avec probabilités cachées (conformité aux règles Roblox 2024+).
- Pas de contenu réellement politique, pas de noms de personnes réelles.
- Tous les achats affichent clairement leur valeur avant confirmation.
- Un joueur peut atteindre le top 20% sans jamais dépenser (équilibre free-to-play).

---

## 7. Thématiques & Politique de Contenu

### 7.1 Distanciation Thématique (Brand Safety)

Le jeu s'inspire d'événements réels sans les reproduire explicitement :

| Inspiration réelle           | Déclinaison dans le jeu                                      |
| ---------------------------- | ------------------------------------------------------------ |
| Élection présidentielle 2027 | "La Grande Joute des Champions" — Camp Écarlate vs Camp Azur |
| PSG vs OM                    | "Classique des Titans" — Les Phares vs Les Étoiles           |
| Rivalité culturelle          | "Guerre des Tendances" — Les Classiques vs Les Neo           |

- **Noms** : Suffisamment évocateurs pour créer une identification, suffisamment flous pour éviter tout problème légal.
- **Personnages** : Archétypes caricaturaux, jamais nominativement identifiables.
- **Interdiction affichée** : Le règlement du jeu interdit explicitement les discussions politiques dans le chat — mais l'univers du jeu alimente la polarisation de manière visuelle et émotionnelle.

### 7.2 Modération & Sécurité

- **Filtre de chat automatique** Roblox activé à 100%.
- Règles claires : pas d'insultes, pas de politique réelle dans le chat.
- **Système de signalement** simplifié (bouton accessible en 2 clics).
- Modérateurs communautaires bénévoles récompensés en Gemmes.

---

## 8. Contenu Saisonnier & Calendrier Éditorial

### 8.1 Saisons (≈ 1 mois chacune)

Complication de mise en oeubre : A VOIR

Chaque saison introduit :

- Une nouvelle guerre thématique principale.
- Un Battle Pass saisonnier avec 30 paliers de récompenses cosmétiques.
- 2-3 nouveaux mini-jeux ou variantes.
- Un boss de fin de saison (événement collectif — toute la communauté doit collaborer).

### 8.2 Calendrier Type

| Semaine | Événement                                                      |
| ------- | -------------------------------------------------------------- |
| S1      | Lancement de saison, nouvelle guerre, Battle Pass              |
| S2      | Mid-season event (mini-jeu exclusif limité 48h)                |
| S3      | Double Points Weekend (vendredi soir → dimanche soir)          |
| S4      | Finale de guerre, cérémonie, révélation de la prochaine saison |

### 8.3 Événements Flash (FOMO)

- **Weekends de Points Doublés** : 2 fois par mois, annoncés 48h à l'avance.
- **Guerres Éclairs** (24-48h) : Guerres ultra-courtes sur des événements d'actualité fictive.
- **Boss Collectif** : Un ennemi commun à tous les camps, battu en coopération → récompenses pour tous.

---

## 9. Leaderboards & Systèmes de Classement

### 9.1 Types de Classements

| Classement                 | Portée       | Reset                  |
| -------------------------- | ------------ | ---------------------- |
| Points de Guerre (semaine) | Par guerre   | Hebdomadaire           |
| Score Général (all-time)   | Global       | Jamais                 |
| Top Contributeurs de Camp  | Par faction  | Hebdomadaire           |
| Classement par Mini-Jeu    | Par mini-jeu | Quotidien/Hebdomadaire |
| Hall of Fame Saisonnier    | Global       | Par saison             |

### 9.2 Visibilité des Classements

- **Affichage en jeu** : Grand tableau d'affichage physique dans le hub central, mis à jour en temps réel.
- **Notifications de changement de rang** : "Tu viens de passer 5ème de ton camp !"
- **Classement des camps** : Affiché en permanence dans le HUD pour tous les joueurs.
- **Profil public** : Chaque joueur a une carte de visite avec ses stats, son camp, et son rang.

---

## 10. Structure Technique & Fonctionnelle (Vue d'Ensemble)

> *Cette section décrit les systèmes à implémenter sans rentrer dans le code.*

### 10.1 Espaces du Jeu

- **Hub Central** : Zone de rassemblement où tous les joueurs (tous camps) cohabitent. Contient les tableaux de scores, les boutiques, les portails vers les mini-jeux.
- **Zones de Camp** : Espaces propres à chaque faction — personnalisables, décorés selon le rang moyen du camp.
- **Arènes de Mini-Jeux** : Instances séparées, accessibles depuis le hub ou les zones de camp.
- **Salle des Trophées** : Exposition permanente des victoires passées, records, champions.

### 10.2 Systèmes Clés à Développer

1. **Système de Factions** — Gestion des camps, des scores, des transferts de joueurs.
2. **Économie Serveur** — Calcul et persistance des Coins, Gemmes, Points de Camp.
3. **Gestionnaire de Guerres** — Création, déroulement, clôture et archivage des guerres.
4. **Moteur de Mini-Jeux** — Framework modulaire permettant d'ajouter des mini-jeux rapidement.
5. **Système de Boutique** — Interface d'achat, intégration Robux, catalogue dynamique.
6. **Moteur de Quêtes** — Système configurable de quêtes quotidiennes/hebdomadaires/saisonnières.
7. **Panneau Admin** — Interface d'administration no-code pour gérer les guerres et événements.
8. **Système de Notifications** — Alertes in-game et (si possible) push via Roblox.
9. **Anti-Triche** — Validation serveur de tous les gains de points et transactions.

---

## 11. KPIs & Métriques de Succès

### 11.1 Engagement

| Métrique                         | Cible à 3 mois            |
| -------------------------------- | ------------------------- |
| DAU (Joueurs actifs quotidiens)  | > 500                     |
| Session moyenne                  | > 18 min                  |
| Taux de rétention J7             | > 35%                     |
| Taux de rétention J30            | > 15%                     |
| Joueurs actifs en fin de semaine | +40% vs milieu de semaine |

### 11.2 Monétisation

| Métrique                                  | Cible à 3 mois  |
| ----------------------------------------- | --------------- |
| Taux de conversion (paye au moins 1 fois) | > 4%            |
| ARPU (revenu moyen par utilisateur actif) | > 80 Robux/mois |
| Part de revenus — Multiplicateurs         | > 45%           |
| Part de revenus — Abonnement Premium      | > 25%           |
| Part de revenus — Cosmétiques             | > 20%           |

### 11.3 Santé Communautaire

- Ratio camp gagnant/perdant : viser < 60/40 (équilibrage des guerres si déséquilibre).
- Taux de signalement : < 0.5% des sessions.
- NPS communautaire (sondage mensuel) : > 7/10.

---

## 12. Roadmap de Développement

### Phase 1 — MVP (2-3 mois)

- [ ] Hub central + 2 camps + 1 guerre active
- [ ] 3 mini-jeux (course, combat, idle)
- [ ] Économie de base (Coins, Points de Camp)
- [ ] Leaderboard hebdomadaire + reset automatique
- [ ] Boutique basique (multiplicateurs + 2 cosmétiques)

### Phase 2 — Enrichissement (1-2 mois)

- [ ] 4 mini-jeux supplémentaires
- [ ] Système de quêtes quotidiennes & hebdomadaires
- [ ] Battle Pass saisonnier
- [ ] Panneau d'administration des guerres
- [ ] 2ème guerre simultanée

### Phase 3 — Croissance & Live Ops (continu)

- [ ] Événements flash & weekends spéciaux
- [ ] Boss collectif saisonnier
- [ ] Système de guilde/clan au sein des camps
- [ ] Expansion à 4 camps simultanés
- [ ] Intégration d'un système de tournois

---

## Annexe A — Comparatifs de Références

| Jeu                | Mécanique inspirante                                   |
| ------------------ | ------------------------------------------------------ |
| **Clash of Clans** | Wars de clan, reset cyclique, sentiment d'appartenance |
| **Stumble Guys**   | Mini-jeux courts, chaos fun, rejeu immédiat            |
| **Roblox Bedwars** | PvP entre équipes, stratégie simple, cosmétiques       |
| **Among Us**       | Polarisation sociale, suspense, discussions            |
| **Pokémon GO**     | Équipes mondiales (Valor/Mystic/Instinct), événements  |
| **Clash Royale**   | Économie de cartes, progression visible, saisons       |

---

*Document rédigé pour usage interne — v1.0 — Mai 2026*
