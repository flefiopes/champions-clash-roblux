export interface War {
  id: string;
  name: string;
  resetWeekly: boolean;
  endsAt: string | null;
  status: 'active' | 'paused' | 'finished';
  createdAt: string;
  createdBy: string;
}

export interface CreateWarDto {
  name: string;
  reset_weekly: boolean;
  ends_at?: string | null;
}

export interface UpdateWarDto {
  name?: string;
  status?: 'active' | 'paused' | 'finished';
  reset_weekly?: boolean;
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
  minigames: Record<string, { enabled: boolean; max_reward: number }>;
  updatedAt: string;
}

export interface UpdateGameConfigDto {
  globalMultiplier?: number;
  enablePurchases?: boolean;
  enablePointContributions?: boolean;
  maxLevel?: number;
  minigames?: Record<string, { enabled: boolean; max_reward: number }>;
}

export interface Product {
  id: string;
  name: string;
  robloxProductId: number;
  priceRobux: number;
  type: 'gems' | 'boost' | 'cosmetic' | 'faction_reset';
  value: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  roblox_product_id: number;
  price_robux: number;
  type: 'gems' | 'boost' | 'cosmetic' | 'faction_reset';
  value: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  price_robux?: number;
  type?: 'gems' | 'boost' | 'cosmetic' | 'faction_reset';
  value?: Record<string, any>;
  is_active?: boolean;
}

export interface Transaction {
  id: string;
  playerId: string;
  username?: string;
  type: 'coin_gain' | 'coin_spend' | 'gem_gain' | 'gem_spend' | 'point_contribution' | 'xp_gain';
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
