import { describe, it, expect } from 'bun:test';
import { adminClient } from './test-client';

/**
 * Integration tests for admin statistics.
 * These tests assume the server is running.
 */
describe('Admin Stats', () => {
  it('should retrieve dashboard stats', async () => {
    const response = await adminClient.get('/admin/stats');

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toBeDefined();
    // Verify some expected keys if possible
    // expect(response.data.data).toHaveProperty('totalPlayers');
  });

  it('should retrieve recent activity', async () => {
    const response = await adminClient.get('/admin/activity');

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('recentQuests');
    expect(response.data.data).toHaveProperty('recentTransactions');
    expect(Array.isArray(response.data.data.recentQuests)).toBe(true);
    expect(Array.isArray(response.data.data.recentTransactions)).toBe(true);
  });

  it('should return 401 when X-Admin-Key is invalid', async () => {
    const response = await adminClient.get('/admin/stats', {
      headers: { 'X-Admin-Key': 'wrong_key' },
    });
    expect(response.status).toBe(401);
  });
});
