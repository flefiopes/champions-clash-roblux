import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiRequest } from '@/lib/api-client';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/admin.types';

export function useAdminProducts() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-products'];

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<Product[]>({ url: '/admin/products', method: 'GET' }),
  });

  const createProduct = useMutation({
    mutationFn: (data: CreateProductDto) =>
      apiRequest<Product>({
        url: '/admin/products',
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      apiRequest<Product>({
        url: `/admin/products/${id}`,
        method: 'PUT',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    productsQuery,
    createProduct,
    updateProduct,
  };
}
