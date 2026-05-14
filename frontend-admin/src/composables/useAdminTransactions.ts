import { useQuery } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { Transaction, PaginatedResponse } from '@/types/admin.types';

export function useAdminTransactions(limit = 100, filters: Record<string, string | number> = {}) {
  const queryKey = ['admin-transactions', limit, filters];

  const transactionsQuery = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...filters,
      });
      return apiRequest<PaginatedResponse<Transaction>>({
        url: `/admin/transactions?${params.toString()}`,
        method: 'GET',
      });
    },
  });

  return {
    transactionsQuery,
  };
}
