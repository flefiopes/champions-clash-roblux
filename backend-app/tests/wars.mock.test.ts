import { describe, it, expect, mock } from 'bun:test';

const mockActiveWars = [
  {
    id: 'war-1',
    name: 'Test War',
    status: 'active',
    factions: [
      { id: 'faction-1', name: 'Alpha', totalPoints: 1000 },
      { id: 'faction-2', name: 'Beta', totalPoints: 800 },
    ],
  },
];

const warService = {
  getActiveWars: mock(async () => {
    await Promise.resolve();
    return mockActiveWars;
  }),
  getLeaderboard: mock(async (_warId: string, _limit: number) => {
    await Promise.resolve();
    return {
      warId: _warId,
      factions: [],
    };
  }),
};

describe('War Service (Mock)', () => {
  it('should return active wars', async () => {
    const wars = await warService.getActiveWars();
    expect(wars).toEqual(mockActiveWars);
    expect(warService.getActiveWars).toHaveBeenCalled();
  });

  it('should call getLeaderboard with correct params', async () => {
    const warId = 'war-1';
    const limit = 50;
    await warService.getLeaderboard(warId, limit);
    expect(warService.getLeaderboard).toHaveBeenCalledWith(warId, limit);
  });
});
