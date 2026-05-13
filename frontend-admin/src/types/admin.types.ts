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
}

export interface GameConfig {
  id: number;
  globalMultiplier: number;
  enablePurchases: boolean;
  enablePointContributions: boolean;
  maxLevel: number;
  updatedAt: string;
}

export interface UpdateGameConfigDto {
  globalMultiplier?: number;
  enablePurchases?: boolean;
  enablePointContributions?: boolean;
  maxLevel?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceRobux: number;
  rewardType: 'coins' | 'gems' | 'boost';
  rewardAmount: number;
  boostDurationSeconds: number | null;
  boostMultiplier: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  id: string;
  name: string;
  description?: string;
  priceRobux: number;
  rewardType: 'coins' | 'gems' | 'boost';
  rewardAmount: number;
  boostDurationSeconds?: number;
  boostMultiplier?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  priceRobux?: number;
  isActive?: boolean;
}

export interface Transaction {
  id: number;
  playerId: string;
  type: 'coin_gain' | 'coin_spend' | 'gem_gain' | 'gem_spend';
  amount: number;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
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
