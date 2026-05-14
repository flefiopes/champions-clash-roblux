import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { fetchDashboardStats, fetchRecentActivity } from '@/lib/admin-api';

export function useAdminStats() {
  return useQuery({
    queryKey: computed(() => ['admin-stats']),
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // every 30s
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: computed(() => ['admin-activity']),
    queryFn: fetchRecentActivity,
    refetchInterval: 10000, // every 10s for real-time feel
  });
}
