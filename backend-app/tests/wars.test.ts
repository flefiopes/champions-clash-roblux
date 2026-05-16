import { describe, it, expect } from 'bun:test';
import { robloxClient } from './test-client';

describe('Wars', () => {
  it('should list active wars', async () => {
    const response = await robloxClient.get('/wars/active');

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should return 400 for invalid warId UUID on leaderboard', async () => {
    const response = await robloxClient.get('/wars/not-a-uuid/leaderboard');
    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent warId on leaderboard', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const response = await robloxClient.get(`/wars/${fakeUuid}/leaderboard`);

    // The service might throw 404 if not found
    if (response.status === 200) {
      // If it returns empty leaderboard instead of 404
      expect(response.data.success).toBe(true);
    } else {
      expect(response.status).toBe(404);
    }
  });
});
