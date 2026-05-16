import { describe, it, expect, beforeAll } from 'bun:test';
import { robloxClient } from './test-client';

describe('Badges', () => {
  const testRobloxId = 12345678;

  beforeAll(async () => {
    await robloxClient.post('/players/login', {
      roblox_user_id: testRobloxId,
      username: 'BadgeTester',
    });
  });

  it('should retrieve player badges (even if empty)', async () => {
    const response = await robloxClient.get(`/players/${testRobloxId}/badges`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});
