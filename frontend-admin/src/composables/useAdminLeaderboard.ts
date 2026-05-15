/**
 * useAdminLeaderboard composable.
 * Provides functions to fetch top player rankings for monitoring.
 *
 * @module composables/useAdminLeaderboard
 */

import { useQuery } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { Player } from '@/types/admin.types';

/**
 * Custom hook for accessing leaderboard data.
 */
export function useAdminLeaderboard() {
  /**
   * Query to fetch top players globally.
   */
  const playersLeaderboardQuery = useQuery({
    queryKey: ['admin-leaderboard-players'],
    queryFn: () =>
      apiRequest<Player[]>({
        url: '/admin/leaderboard/players',
        method: 'GET',
      }),
  });

  return {
    playersLeaderboardQuery,
  };
}
