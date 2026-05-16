import { describe, it, expect, mock } from 'bun:test';

const purchaseService = {
  processPurchase: mock(async (_robloxUserId: number, _productId: string, _robloxPurchaseId: string) => {
    await Promise.resolve();
    return {
      success: true,
      transactionId: 'tx-123',
    };
  }),
};

describe('Purchase Service (Mock)', () => {
  it('should process purchase correctly', async () => {
    const result = await purchaseService.processPurchase(12345, 'prod-1', 'rob-1');
    expect(result.success).toBe(true);
    expect(purchaseService.processPurchase).toHaveBeenCalledWith(12345, 'prod-1', 'rob-1');
  });
});
