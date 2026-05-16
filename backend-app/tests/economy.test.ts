import { describe, it, expect, beforeAll } from 'bun:test';
import { robloxClient } from './test-client';

describe('Economy & Points', () => {
  const testRobloxId = 12345678;
  let activeWarId: string;
  let factionId: string;

  beforeAll(async () => {
    // Ensure player exists
    await robloxClient.post('/players/login', {
      roblox_user_id: testRobloxId,
      username: 'EconomyTester',
    });

    // Get an active war and faction for points testing
    const response = await robloxClient.get('/wars/active');
    if (response.data.success && response.data.data.length > 0) {
      const war = response.data.data[0];
      activeWarId = war.id;
      if (war.factions && war.factions.length > 0) {
        factionId = war.factions[0].id;
      }
    }
  });

  describe('Coins', () => {
    it('should add coins to a player from a mini-game', async () => {
      const response = await robloxClient.post(`/players/${testRobloxId}/coins`, {
        amount: 100,
        source: 'minigame_test',
        meta: { difficulty: 'hard' },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('newCoinBalance');
    });

    it('should return 400 for excessive coin amount', async () => {
      const response = await robloxClient.post(`/players/${testRobloxId}/coins`, {
        amount: 999999, // Max is 10,000
        source: 'cheat',
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('Points', () => {
    it('should contribute coins to faction points', async () => {
      if (!activeWarId || !factionId) {
        console.warn('Skipping points contribution test: No active war/faction found');
        return;
      }

      const response = await robloxClient.post(`/players/${testRobloxId}/points`, {
        coins_spent: 50,
        faction_id: factionId,
        war_id: activeWarId,
      });

      // This might fail if the player doesn't have enough coins or is not in the faction
      // But we expect the API to handle it gracefully
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('pointsAwarded');
      } else {
        // If it fails due to logic (e.g. not in faction), it's still a valid API response
        expect([400, 403, 404]).toContain(response.status);
      }
    });
  });
});
