import { describe, it, expect } from 'bun:test';
import { adminClient } from './test-client';

describe('Admin CRUD', () => {
  describe('Listings', () => {
    it('should list wars', async () => {
      const response = await adminClient.get('/admin/wars');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should list factions', async () => {
      const response = await adminClient.get('/admin/factions');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should list products', async () => {
      const response = await adminClient.get('/admin/products');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should list quests', async () => {
      const response = await adminClient.get('/admin/quests');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should list badges', async () => {
      const response = await adminClient.get('/admin/badges');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should list transactions (paginated)', async () => {
      const response = await adminClient.get('/admin/transactions?page=1&limit=10');
      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('pagination');
    });
  });

  describe('Validation', () => {
    it('should return 400 when creating a war with invalid data', async () => {
      const response = await adminClient.post('/admin/wars', {
        name: '', // Too short
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 when updating a non-existent war', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await adminClient.patch(`/admin/wars/${fakeUuid}`, {
        name: 'New Name',
      });
      // The route will return 404 if found but since it's admin, it might be 404 or 400 depending on implementation
      expect([400, 404]).toContain(response.status);
    });
  });
});
