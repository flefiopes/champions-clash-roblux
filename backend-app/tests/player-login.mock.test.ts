import { describe, it, expect, mock } from 'bun:test';

// Mocking the player service before it's imported in the route/handler
// Note: In real scenarios, you might need to mock the underlying DB or service
// depending on how the routes are structured.

const mockProfile = {
  id: 'uuid-123',
  robloxUserId: 12345,
  username: 'MockUser',
  coins: 100,
  gems: 10,
};

// Example of mocking a service function
const playerService = {
  loginOrCreate: mock(async (_robloxId: number, _username: string) => {
    await Promise.resolve();
    return 'uuid-123';
  }),
  getProfile: mock(async (_robloxId: number) => {
    await Promise.resolve();
    return mockProfile;
  }),
};

describe('Player Service (Mock)', () => {
  it('should call loginOrCreate with correct params', async () => {
    const robloxId = 12345;
    const username = 'MockUser';

    await playerService.loginOrCreate(robloxId, username);

    expect(playerService.loginOrCreate).toHaveBeenCalledWith(robloxId, username);
  });

  it('should return a profile from mock', async () => {
    const profile = await playerService.getProfile(12345);

    expect(profile).toEqual(mockProfile);
    expect(playerService.getProfile).toHaveBeenCalled();
  });
});
