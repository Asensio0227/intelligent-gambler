import api from './api';
import { IUser } from '@/types/auth.types';

export const adminService = {
  // NOTE: /admin/stats endpoint does not exist on backend
  // Use individual endpoints instead
  getUsers: (params?: { search?: string; isActive?: boolean; role?: string }) =>
    api.get<IUser[]>('/admin/users', { params }),

  updateUser: (id: string, data: Partial<IUser>) =>
    api.patch<IUser>(`/admin/users/${id}`, data),

  createUser: (data: Partial<IUser> & { password: string }) =>
    api.post<IUser>('/admin/users', data),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),

  banUser: (id: string) =>
    api.patch<IUser>(`/admin/users/${id}/ban`),

  unbanUser: (id: string) =>
    api.patch<IUser>(`/admin/users/${id}/unban`),

  suspendUser: (id: string, days: number, reason: string) =>
    api.patch<{ user: IUser; suspension: any }>(`/admin/users/${id}/suspend`, { days, reason }),

  getAllTickets: (filters?: {
    status?: string;
    sort?: 'newest' | 'oldest';
    minLegs?: number;
    maxLegs?: number;
    minAvg?: number;
    maxAvg?: number;
  }) =>
    api.get('/admin/tickets', { params: filters }),

  getAllPredictions: () =>
    api.get('/admin/predictions'),

  syncFixtures: () =>
    api.post('/admin/fixtures/sync'),
};
