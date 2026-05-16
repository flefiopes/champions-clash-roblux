import { describe, it, expect } from 'bun:test';
import { robloxClient } from './test-client';

describe('Mini-games', () => {
  it('should return 400 for invalid mini-game result submission', async () => {
    const response = await robloxClient.post('/minigames/result', {
      roblox_user_id: 12345,
      // Missing minigame_id
    });

    expect(response.status).toBe(400);
    expect(response.data.success).toBe(false);
  });
});
