import { useQuery } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { Transaction, PaginatedResponse } from '@/types/admin.types';

export function useAdminTransactions(limit = 100) {
  const queryKey = ['admin-transactions', limit];

  const transactionsQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<PaginatedResponse<Transaction>>({ url: `/admin/transactions?limit=${limit}`, method: 'GET' }),
  });

  return {
    transactionsQuery,
  };
}
