import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { Faction, CreateFactionDto, UpdateFactionDto } from '@/types/admin.types';

export function useAdminFactions() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-factions'];

  const factionsQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<Faction[]>({ url: '/admin/factions', method: 'GET' }),
  });

  const createFaction = useMutation({
    mutationFn: (data: CreateFactionDto) =>
      apiRequest<Faction>({
        url: '/admin/factions',
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateFaction = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFactionDto }) =>
      apiRequest<Faction>({
        url: `/admin/factions/${id}`,
        method: 'PATCH',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    factionsQuery,
    createFaction,
    updateFaction,
  };
}
