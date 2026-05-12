import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { War, CreateWarDto, UpdateWarDto } from '@/types/admin.types';

export function useAdminWars() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-wars'];

  const warsQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<War[]>({ url: '/admin/wars', method: 'GET' }),
  });

  const createWar = useMutation({
    mutationFn: (data: CreateWarDto) =>
      apiRequest<War>({
        url: '/admin/wars',
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateWar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarDto }) =>
      apiRequest<War>({
        url: `/admin/wars/${id}`,
        method: 'PUT',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    warsQuery,
    createWar,
    updateWar,
  };
}
