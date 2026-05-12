export interface War {
  id: number;
  seasonName: string;
  startDate: string;
  endDate: string | null;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarDto {
  seasonName: string;
}

export interface UpdateWarDto {
  seasonName?: string;
  status?: 'pending' | 'active' | 'completed';
}

export interface Faction {
  id: string;
  name: string;
  colorHex: string;
  maxPlayers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFactionDto {
  id: string;
  name: string;
  colorHex: string;
  maxPlayers?: number;
}

export interface UpdateFactionDto {
  name?: string;
  colorHex?: string;
  maxPlayers?: number;
  isActive?: boolean;
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
