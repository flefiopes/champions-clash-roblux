import { describe, it, expect, beforeAll } from 'bun:test';
import { robloxClient } from './test-client';

describe('Redis Caching', () => {
  const testRobloxId = 99887766;

  beforeAll(async () => {
    // Ensure player exists
    await robloxClient.post('/players/login', {
      roblox_user_id: testRobloxId,
      username: 'CacheTester',
    });
  });

  it('should cache player profile and invalidate on coin gain', async () => {
    // 1. Initial fetch (should hit DB and populate cache)
    const res1 = await robloxClient.get(`/players/${testRobloxId}`);
    expect(res1.status).toBe(200);
    const initialCoins = res1.data.data.coins;

    // 2. Fetch again (should hit cache)
    const res2 = await robloxClient.get(`/players/${testRobloxId}`);
    expect(res2.status).toBe(200);
    expect(res2.data.data.coins).toBe(initialCoins);

    // 3. Mutate data (should invalidate cache)
    await robloxClient.post(`/players/${testRobloxId}/coins`, {
      amount: 50,
      source: 'cache_test',
    });

    // 4. Fetch again (should hit DB with updated value)
    const res3 = await robloxClient.get(`/players/${testRobloxId}`);
    expect(res3.status).toBe(200);
    expect(res3.data.data.coins).toBe(initialCoins + 50);
  });

  it('should cache public config', async () => {
    const res1 = await robloxClient.get('/config');
    expect(res1.status).toBe(200);
    
    const res2 = await robloxClient.get('/config');
    expect(res2.status).toBe(200);
    expect(res2.data.data).toEqual(res1.data.data);
  });
});
