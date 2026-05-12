/**
 * Admin API wrappers.
 * Uses the pre-configured apiRequest generic wrapper.
 *
 * @module lib/admin-api
 */

import { apiRequest } from './api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  AdminUser,
  AdminProject,
  AdminTrack,
  AdminShareLink,
  DashboardStats,
} from '@/types/admin.types';

/** User APIs */

export function fetchUsers(page = 1, limit = 20, search?: string) {
  return apiRequest<PaginatedResponse<AdminUser>>({
    url: '/admin/users',
    method: 'GET',
    params: { page, limit, search },
  });
}

export function fetchUserDetails(id: string) {
  return apiRequest<AdminUser>({
    url: `/admin/users/${id}`,
    method: 'GET',
  });
}

export function updateUserStatus(id: string, status: string) {
  return apiRequest<void>({
    url: `/admin/users/${id}/status`,
    method: 'PATCH',
    data: { status },
  });
}

export function deleteUser(id: string) {
  return apiRequest<void>({
    url: `/admin/users/${id}`,
    method: 'DELETE',
  });
}

/** Project APIs */

export function fetchProjects(page = 1, limit = 20, search?: string) {
  return apiRequest<PaginatedResponse<AdminProject>>({
    url: '/admin/projects',
    method: 'GET',
    params: { page, limit, search },
  });
}

export function fetchProjectDetails(id: string) {
  return apiRequest<AdminProject>({
    url: `/admin/projects/${id}`,
    method: 'GET',
  });
}

export function updateProjectStatus(id: string, status: string) {
  return apiRequest<void>({
    url: `/admin/projects/${id}/status`,
    method: 'PATCH',
    data: { status },
  });
}

export function deleteProject(id: string) {
  return apiRequest<void>({
    url: `/admin/projects/${id}`,
    method: 'DELETE',
  });
}

/** Track APIs */

export function fetchTracks(page = 1, limit = 20, search?: string) {
  return apiRequest<PaginatedResponse<AdminTrack>>({
    url: '/admin/tracks',
    method: 'GET',
    params: { page, limit, search },
  });
}

export function fetchTrackDetails(id: string) {
  return apiRequest<AdminTrack>({
    url: `/admin/tracks/${id}`,
    method: 'GET',
  });
}

export function deleteTrack(id: string) {
  return apiRequest<void>({
    url: `/admin/tracks/${id}`,
    method: 'DELETE',
  });
}

/** Share Link APIs */

export function fetchShareLinks(page = 1, limit = 20, search?: string) {
  return apiRequest<PaginatedResponse<AdminShareLink>>({
    url: '/admin/share-links',
    method: 'GET',
    params: { page, limit, search },
  });
}

export function fetchShareLinkDetails(id: string) {
  return apiRequest<AdminShareLink>({
    url: `/admin/share-links/${id}`,
    method: 'GET',
  });
}

export function deleteShareLink(id: string) {
  return apiRequest<void>({
    url: `/admin/share-links/${id}`,
    method: 'DELETE',
  });
}

/** Stats APIs */

export function fetchDashboardStats() {
  return apiRequest<DashboardStats>({
    url: '/admin/stats',
    method: 'GET',
  });
}
