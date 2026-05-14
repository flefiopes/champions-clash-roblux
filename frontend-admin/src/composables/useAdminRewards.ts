/**
 * Admin rewards composable.
 * Handles fetching and mutating quest and badge definitions.
 *
 * @module composables/useAdminRewards
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';

import type { Quest, Badge } from '@/types/admin.types';

export function useAdminQuests() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-quests'];

  const questsQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<Quest[]>({ url: '/admin/quests', method: 'GET' }),
  });

  const createQuest = useMutation({
    mutationFn: (data: Partial<Quest>) =>
      apiRequest<{ id: string }>({
        url: '/admin/quests',
        method: 'POST',
        data,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateQuest = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quest> }) =>
      apiRequest({ url: `/admin/quests/${id}`, method: 'PATCH', data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { questsQuery, createQuest, updateQuest };
}

export function useAdminBadges() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-badges'];

  const badgesQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<Badge[]>({ url: '/admin/badges', method: 'GET' }),
  });

  const createBadge = useMutation({
    mutationFn: (data: Partial<Badge>) =>
      apiRequest<{ id: string }>({
        url: '/admin/badges',
        method: 'POST',
        data,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateBadge = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Badge> }) =>
      apiRequest({ url: `/admin/badges/${id}`, method: 'PATCH', data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { badgesQuery, createBadge, updateBadge };
}
