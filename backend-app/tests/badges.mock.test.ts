import { describe, it, expect, mock } from 'bun:test';

const mockBadges = [
  {
    id: 'badge-1',
    slug: 'first_login',
    name: 'First Login',
    description: 'Welcome to the game!',
    imageUrl: 'http://example.com/badge.png',
    rarity: 'common',
    isPermanent: true,
  },
];

const badgeService = {
  getPlayerBadges: mock(async (_playerId: string) => {
    await Promise.resolve();
    return mockBadges;
  }),
};

describe('Badge Service (Mock)', () => {
  it('should return badges for a player', async () => {
    const badges = await badgeService.getPlayerBadges('uuid-123');

    expect(badges).toEqual(mockBadges);
    expect(badgeService.getPlayerBadges).toHaveBeenCalledWith('uuid-123');
  });
});
