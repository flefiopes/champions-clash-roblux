import { describe, it, expect, mock } from 'bun:test';

const mockStats = {
  totalPlayers: 1000,
  activeWars: 1,
  totalRevenue: 50000,
};

const adminService = {
  getDashboardStats: mock(async () => {
    await Promise.resolve();
    return mockStats;
  }),
};

describe('Admin Service (Mock)', () => {
  it('should return stats from mock', async () => {
    const stats = await adminService.getDashboardStats();

    expect(stats).toEqual(mockStats);
    expect(adminService.getDashboardStats).toHaveBeenCalled();
  });
});
