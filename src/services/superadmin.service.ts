import api from './api';
import { IUser } from '@/types/auth.types';

export const superadminService = {
  // All superadmin routes are under /admin on the backend
  getUsage: () =>
    api.get('/admin/usage'),

  getAdmins: () =>
    api.get<IUser[]>('/admin/admins'),

  createAdmin: (data: { name: string; lastName?: string; email: string; password: string }) =>
    api.post<IUser>('/admin/admins', data),

  removeAdmin: (id: string) =>
    api.delete(`/admin/admins/${id}`),

  getSystemConfig: () =>
    api.get('/admin/system'),

  getMarketAccuracy: () =>
    api.get('/admin/market-accuracy'),
};
