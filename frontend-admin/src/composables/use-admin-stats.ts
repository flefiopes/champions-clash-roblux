import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { fetchDashboardStats } from '@/lib/admin-api';

export function useAdminStats() {
  return useQuery({
    queryKey: computed(() => ['admin-stats']),
    queryFn: fetchDashboardStats,
    refetchInterval: 60000, // auto-refresh every minute
  });
}
