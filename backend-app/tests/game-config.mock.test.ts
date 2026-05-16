import { describe, it, expect, mock } from 'bun:test';

const mockConfig = {
  minigames: {},
  globalMultiplier: 1.5,
  doublePointsWeekend: false,
  maxWarsPerPlayer: 3,
  coinToPointRate: 10,
};

const configService = {
  getPublicConfig: mock(async () => {
    await Promise.resolve();
    return mockConfig;
  }),
};

describe('Config Service (Mock)', () => {
  it('should return public config', async () => {
    const config = await configService.getPublicConfig();
    expect(config).toEqual(mockConfig);
    expect(configService.getPublicConfig).toHaveBeenCalled();
  });
});
