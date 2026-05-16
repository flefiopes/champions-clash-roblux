import { describe, it, expect } from 'bun:test';
import { robloxClient } from './test-client';

describe('Game Config (Roblox)', () => {
  it('should retrieve public game config', async () => {
    const response = await robloxClient.get('/config');

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('minigames');
    expect(response.data.data).toHaveProperty('globalMultiplier');
  });
});
