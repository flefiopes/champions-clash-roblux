import { describe, it, expect, mock } from 'bun:test';

const economyService = {
  addCoins: mock(async (_playerId: string, _amount: number, _source: string) => {
    await Promise.resolve();
    return 1000; // New balance
  }),
  contributePoints: mock(
    async (_playerId: string, _coins: number, _factionId: string, _warId: string) => {
      await Promise.resolve();
      return {
        pointsAwarded: 50,
        newCoinBalance: 950,
        globalMultiplier: 1.0,
      };
    }
  ),
};

describe('Economy Service (Mock)', () => {
  it('should call addCoins with correct params', async () => {
    const result = await economyService.addCoins('uuid-123', 100, 'minigame_test');

    expect(result).toBe(1000);
    expect(economyService.addCoins).toHaveBeenCalledWith('uuid-123', 100, 'minigame_test');
  });

  it('should call contributePoints and return awards', async () => {
    const result = await economyService.contributePoints('uuid-123', 50, 'faction-1', 'war-1');

    expect(result.pointsAwarded).toBe(50);
    expect(economyService.contributePoints).toHaveBeenCalled();
  });
});
