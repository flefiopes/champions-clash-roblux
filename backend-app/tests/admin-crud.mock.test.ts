import { describe, it, expect, mock } from 'bun:test';

const adminService = {
  listWars: mock(async () => {
    await Promise.resolve();
    return [{ id: '1', name: 'War 1' }];
  }),
  createWar: mock(async (_data: unknown) => {
    await Promise.resolve();
    return 'new-war-id';
  }),
  updateWar: mock(async (_id: string, _data: unknown) => {
    await Promise.resolve();
    return;
  }),
};

describe('Admin Service CRUD (Mock)', () => {
  it('should list wars from mock', async () => {
    const wars = await adminService.listWars();
    expect(wars).toHaveLength(1);
    expect(adminService.listWars).toHaveBeenCalled();
  });

  it('should call createWar with correct data', async () => {
    const data = { name: 'New War' };
    const id = await adminService.createWar(data);
    expect(id).toBe('new-war-id');
    expect(adminService.createWar).toHaveBeenCalledWith(data);
  });
});
