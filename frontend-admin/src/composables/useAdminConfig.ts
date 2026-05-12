import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { GameConfig, UpdateGameConfigDto } from '@/types/admin.types';

export function useAdminConfig() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-config'];

  const configQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<GameConfig>({ url: '/admin/config', method: 'GET' }),
  });

  const updateConfig = useMutation({
    mutationFn: (data: UpdateGameConfigDto) =>
      apiRequest<GameConfig>({
        url: '/admin/config',
        method: 'PUT',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    configQuery,
    updateConfig,
  };
}
