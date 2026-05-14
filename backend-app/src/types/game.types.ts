/**
 * Game-specific type definitions.
 * Shared domain types used across services, routes, and validation layers.
 *
 * @module types/game
 */

/** Player rank progression order */
export type PlayerRank =
  | 'recruit'
  | 'militant'
  | 'activist'
  | 'veteran'
  | 'elite'
  | 'champion'
  | 'legend';

/** War lifecycle states */
export type WarStatus = 'active' | 'paused' | 'finished';

/** Economy transaction types */
export type TransactionType =
  | 'coin_gain'
  | 'coin_spend'
  | 'gem_gain'
  | 'gem_spend'
  | 'point_contribution'
  | 'xp_gain'
  | 'upgrade_buy'
  | 'idle_collect';

/** Purchasable product categories */
export type ProductType = 'gems' | 'boost' | 'cosmetic' | 'faction_reset';

/**
 * Public player profile returned by GET /players/:robloxId.
 */
export interface PlayerProfile {
  id: string;
  robloxUserId: number;
  username: string;
  coins: number;
  gems: number;
  xp: number;
  rank: PlayerRank;
  level: number;
  nextLevelXp: number;
  loginStreak: number;
  lastSeen: Date | null;
  forceLevel: number;
  speedLevel: number;
  luckLevel: number;
  prestigeLevel: number;
  avgSessionHour: number | null;
  idleLastCollectedAt: Date | null;
  createdAt: Date;
  /** Active faction memberships across all joined wars */
  factions: PlayerFactionSummary[];
}

/**
 * Summary of a player's membership in a single war faction.
 */
export interface PlayerFactionSummary {
  factionId: string;
  factionName: string;
  warId: string;
  warName: string;
  weeklyPoints: number;
  alltimePoints: number;
  joinedAt: Date;
}

/**
 * Active war with its factions and current scores.
 */
export interface ActiveWar {
  id: string;
  name: string;
  status: WarStatus;
  resetWeekly: boolean;
  lastResetAt: Date | null;
  endsAt: Date | null;
  factions: FactionScore[];
}

/**
 * Faction with current score data, returned in war listings.
 */
export interface FactionScore {
  id: string;
  warId: string;
  name: string;
  colorHex: string;
  slogan: string;
  totalPoints: number;
  memberCount: number;
  dynamicMultiplier: number;
  isBotAssisted: boolean;
}

/**
 * Single leaderboard entry within a faction.
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  robloxUserId: number;
  username: string;
  weeklyPoints: number;
  alltimePoints: number;
  playerRank: PlayerRank;
}

/**
 * Leaderboard response for a war, grouped by faction.
 */
export interface WarLeaderboard {
  warId: string;
  warName: string;
  factions: {
    factionId: string;
    factionName: string;
    entries: LeaderboardEntry[];
  }[];
}

/**
 * Active boost data returned to Roblox clients.
 */
export interface ActiveBoostData {
  id: string;
  type: string;
  multiplier: number;
  expiresAt: Date;
}

/**
 * Daily usage limits for rate-limited actions per player.
 */
export interface DailyLimits {
  quiz: { used: number; max: number };
  idleCollect: { used: number; max: number };
}

/**
 * Public game configuration snapshot polled by Roblox every 5 minutes.
 */
export interface PublicGameConfig {
  minigames: Record<
    string,
    {
      enabled: boolean;
      max_reward: number;
    }
  >;
  globalMultiplier: number;
  doublePointsWeekend: boolean;
  maxWarsPerPlayer: number;
  coinToPointRate: number;
}

/**
 * Boost effect payload stored in products.value for type = "boost".
 */
export interface BoostProductValue {
  boost: string;
  duration_seconds: number;
  multiplier: number;
}

/** Gem pack payload stored in products.value for type = "gems". */
export interface GemsProductValue {
  gems: number;
}

/** Quest categories */
export type QuestType = 'daily' | 'recruit' | 'seasonal' | 'secret';

/** Player-specific quest lifecycle states */
export type QuestStatus = 'active' | 'completed' | 'claimed';

/** Full player-quest progress snapshot */
export interface PlayerQuest {
  questId: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  requirementType: string;
  requirementValue: number;
  currentValue: number;
  rewardCoins: number;
  rewardGems: number;
  rewardXp: number;
  rewardBadgeId: string | null;
  assignedAt: Date;
}

/** Visual rarity tiers for collectibles */
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'secret';

/** Public badge definition */
export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: BadgeRarity;
  isPermanent: boolean;
}
