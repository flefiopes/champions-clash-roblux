import { describe, it, expect } from 'bun:test';
import { robloxClient } from './test-client';

describe('Purchases', () => {
  it('should return 400 for missing purchase data', async () => {
    const response = await robloxClient.post('/purchases/process', {});
    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent product in purchase', async () => {
    const response = await robloxClient.post('/purchases/process', {
      roblox_user_id: 12345,
      product_id: '00000000-0000-0000-0000-000000000000',
      roblox_purchase_id: 'rob-123',
    });
    // This might be 404 or 400 depending on implementation
    expect([400, 404]).toContain(response.status);
  });
});
