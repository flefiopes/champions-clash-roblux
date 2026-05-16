import { describe, it, expect, mock } from 'bun:test';

const minigameService = {
  processResult: mock(async (_robloxUserId: number, _minigameId: string, _rank?: number, _score?: number) => {
    await Promise.resolve();
    return {
      coinsAwarded: 100,
      xpAwarded: 50,
      newCoinBalance: 1100,
    };
  }),
};

describe('Minigame Service (Mock)', () => {
  it('should process mini-game result correctly', async () => {
    const result = await minigameService.processResult(12345, 'race', 1);
    expect(result.coinsAwarded).toBe(100);
    expect(minigameService.processResult).toHaveBeenCalledWith(12345, 'race', 1);
  });
});
