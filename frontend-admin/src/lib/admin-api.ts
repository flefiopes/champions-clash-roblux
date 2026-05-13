/**
 * Admin API wrappers.
 * Uses the pre-configured apiRequest generic wrapper.
 *
 * @module lib/admin-api
 */

import { apiRequest } from './api-client';
import type { DashboardStats } from '@/types/admin.types';

/** Stats APIs */

export function fetchDashboardStats() {
  return apiRequest<DashboardStats>({
    url: '/admin/stats',
    method: 'GET',
  });
}
