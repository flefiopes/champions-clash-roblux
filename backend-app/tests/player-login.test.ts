import { describe, it, expect } from 'bun:test';
import { robloxClient } from './test-client';

/**
 * Integration tests for player login and profile retrieval.
 * These tests assume the server is running.
 */
describe('Player Login & Profile', () => {
  const testRobloxId = 12345678;
  const testUsername = 'TestPlayer';

  it('should successfully login/create a player', async () => {
    const response = await robloxClient.post('/players/login', {
      roblox_user_id: testRobloxId,
      username: testUsername,
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.robloxUserId).toBe(testRobloxId);
    expect(response.data.data.username).toBe(testUsername);
  });

  it('should retrieve a player profile', async () => {
    const response = await robloxClient.get(`/players/${testRobloxId}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.robloxUserId).toBe(testRobloxId);
  });

  it('should return 400 for invalid robloxId format', async () => {
    const response = await robloxClient.get('/players/abc');
    expect(response.status).toBe(400);
    expect(response.data.success).toBe(false);
  });

  it('should return 401 when X-API-Key is missing', async () => {
    const response = await robloxClient.get(`/players/${testRobloxId}`, {
      headers: { 'X-API-Key': '' },
    });
    expect(response.status).toBe(401);
  });
});
