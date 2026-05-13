import { useQuery } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { MinigameStat } from '@/types/admin.types';

export function useAdminMinigames() {
  const minigamesQuery = useQuery({
    queryKey: ['admin-minigames'],
    queryFn: () => apiRequest<MinigameStat[]>({ url: '/admin/minigames', method: 'GET' }),
  });

  return {
    minigamesQuery,
  };
}
