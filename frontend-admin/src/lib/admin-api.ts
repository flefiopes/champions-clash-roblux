/**
 * Admin API wrappers.
 * Uses the pre-configured apiRequest generic wrapper.
 *
 * @module lib/admin-api
 */

import { apiRequest } from './api-client';
import type { DashboardStats, RecentActivity } from '@/types/admin.types';

/** Stats APIs */

export function fetchDashboardStats() {
  return apiRequest<DashboardStats>({
    url: '/admin/stats',
    method: 'GET',
  });
}

export function fetchRecentActivity() {
  return apiRequest<RecentActivity>({
    url: '/admin/activity',
    method: 'GET',
  });
}
