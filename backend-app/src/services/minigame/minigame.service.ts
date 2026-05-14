/**
 * Mini-game service.
 * Processes results from Roblox mini-game instances and distributes rewards.
 * Every result is validated and produces coin/XP gain transactions.
 *
 * @module services/minigame
 */

import { createChildLogger } from '@/lib/logger';
import { getPublicConfig } from '@/services/config/config.service';
import * as economyService from '@/services/economy/economy.service';
import * as playerService from '@/services/player/player.service';
import { updateQuestProgress } from '@/services/quest/quest.service';
import { AppError, AppErrorCode } from '@/lib/app-error';

/** Mini-game service logger */
const logger = createChildLogger({ module: 'minigame-service' });

/** Base coin rewards by rank (1-10) for standard competitive mini-games */
const BASE_RANK_REWARDS: Record<number, number> = {
  1: 200,
  2: 150,
  3: 120,
  4: 100,
  5: 80,
  6: 70,
  7: 60,
  8: 50,
  9: 40,
  10: 30,
};

/**
 * Processes a mini-game completion and awards coins/XP.
 *
 * @param robloxUserId - Roblox userId of the player
 * @param minigameId - Identifier of the mini-game (e.g. "race")
 * @param rank - Player's finishing rank (1-10)
 * @param score - Optional raw score (e.g. time in seconds)
 * @returns Object with awarded amounts and new balances
 */
export async function processResult(
  robloxUserId: number,
  minigameId: string,
  rank?: number,
  score?: number
): Promise<{ coinsAwarded: number; xpAwarded: number; newCoinBalance: number }> {
  const config = await getPublicConfig();

  // Validate mini-game exists and is active
  const gameConfig = config.minigames[minigameId];
  if (!gameConfig) {
    throw new AppError(AppErrorCode.VALIDATION_ERROR, `Mini-game '${minigameId}' not found`, 404);
  }

  if (!gameConfig.enabled) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      `Mini-game '${minigameId}' is currently disabled`,
      400
    );
  }

  // Resolve player
  const playerId = await playerService.loginOrCreate(robloxUserId, 'Unknown');

  // Calculate rewards
  let baseCoins = 0;
  if (rank && BASE_RANK_REWARDS[rank]) {
    baseCoins = BASE_RANK_REWARDS[rank];
  } else if (score) {
    baseCoins = Math.floor(score / 10);
  }

  // Enforce max reward cap
  if (baseCoins > gameConfig.max_reward) {
    logger.warn(
      { robloxUserId, minigameId, baseCoins, maxReward: gameConfig.max_reward },
      'Mini-game reward capped to max_reward'
    );
    baseCoins = gameConfig.max_reward;
  }

  // Apply global multiplier
  const coinsAwarded = Math.floor(baseCoins * config.globalMultiplier);
  const xpAwarded = Math.floor(coinsAwarded * 0.5); // Standard: 1 Coin = 0.5 XP

  // Grant rewards
  const newCoinBalance = await economyService.addCoins(
    playerId,
    coinsAwarded,
    `minigame_${minigameId}`,
    {
      rank,
      score,
      minigameId,
    }
  );

  await economyService.addXp(playerId, xpAwarded, `minigame_${minigameId}`);

  // Track quest progress
  await updateQuestProgress(playerId, 'coins_earned', coinsAwarded);
  await updateQuestProgress(playerId, 'games_played', 1);

  logger.info(
    { robloxUserId, minigameId, rank, score, coinsAwarded, xpAwarded },
    'Mini-game result processed'
  );

  return { coinsAwarded, xpAwarded, newCoinBalance };
}
