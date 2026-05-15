export interface War {
  id: string;
  name: string;
  resetWeekly: boolean;
  scheduledAt: string | null;
  endsAt: string | null;
  status: 'active' | 'paused' | 'finished';
  createdAt: string;
  createdBy: string;
}

export interface CreateWarDto {
  name: string;
  reset_weekly: boolean;
  scheduled_at?: string | null;
  ends_at?: string | null;
}

export interface UpdateWarDto {
  name?: string;
  status?: 'active' | 'paused' | 'finished';
  reset_weekly?: boolean;
  scheduled_at?: string | null;
  ends_at?: string | null;
}

export interface Faction {
  id: string;
  warId: string;
  warName?: string;
  name: string;
  colorHex: string;
  slogan: string;
  totalPoints: number;
  createdAt: string;
}

export interface CreateFactionDto {
  war_id: string;
  name: string;
  color_hex: string;
  slogan: string;
}

export interface UpdateFactionDto {
  name?: string;
  color_hex?: string;
  slogan?: string;
  total_points?: number;
}

export interface GameConfig {
  globalMultiplier: number;
  enablePurchases: boolean;
  enablePointContributions: boolean;
  maxLevel: number;
  dailyQuestsCount: number;
  idleCoinBaseRate: number;
  rubberBandMultiplier: number;
  minigames: Record<string, { enabled: boolean; max_reward: number }>;
  updatedAt: string;
}

export interface UpdateGameConfigDto {
  globalMultiplier?: number;
  enablePurchases?: boolean;
  enablePointContributions?: boolean;
  maxLevel?: number;
  dailyQuestsCount?: number;
  idleCoinBaseRate?: number;
  rubberBandMultiplier?: number;
  minigames?: Record<string, { enabled: boolean; max_reward: number }>;
}

export interface Product {
  id: string;
  name: string;
  robloxProductId: number;
  priceRobux: number;
  type: 'gems' | 'boost' | 'cosmetic' | 'faction_reset';
  value: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  roblox_product_id: number | null;
  price_robux: number;
  type: 'gems' | 'boost' | 'cosmetic' | 'faction_reset';
  value: Record<string, unknown>;
  is_active?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  price_robux?: number;
  type?: 'gems' | 'boost' | 'cosmetic' | 'faction_reset';
  value?: Record<string, unknown>;
  is_active?: boolean;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'secret';
  isPermanent: boolean;
  createdAt: string;
}

export interface CreateBadgeDto {
  slug: string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'secret';
  is_permanent?: boolean;
}

export interface Quest {
  id: string;
  type: 'daily' | 'recruit' | 'seasonal' | 'secret';
  title: string;
  description: string;
  requirementType: string;
  requirementValue: number;
  rewardCoins: number;
  rewardGems: number;
  rewardXp: number;
  rewardBadgeId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateQuestDto {
  type: 'daily' | 'recruit' | 'seasonal' | 'secret';
  title: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  reward_coins: number;
  reward_gems: number;
  reward_xp: number;
  reward_badge_id?: string | null;
  expires_at?: string | null;
}

export interface Transaction {
  id: string;
  playerId: string;
  pseudo?: string;
  type:
    | 'coin_gain'
    | 'coin_spend'
    | 'gem_gain'
    | 'gem_spend'
    | 'point_contribution'
    | 'xp_gain'
    | 'idle_collect'
    | 'upgrade_buy'
    | 'quest_reward';
  amount: number;
  source: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export interface MinigameStat {
  minigameId: string;
  totalRuns: number;
  totalCoins: number;
}

export interface DashboardStats {
  totalPlayers: number;
  totalWars: number;
  activeWars: number;
  totalFactions: number;
  dailyActiveUsers: number;
  avgPrestige: number;
  activeQuests: number;
}

export interface RecentActivity {
  recentQuests: Array<{
    id: string;
    playerId: string;
    pseudo: string;
    completedAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    pseudo: string;
    type: string;
    amount: number;
    createdAt: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Player {
  id: string;
  pseudo: string;
  prestigeLevel: number;
  xp: number;
  coins: number;
  rank: string;
}
