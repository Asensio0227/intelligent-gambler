import api from './api';
import { ILoginPayload, IRegisterPayload, IUser } from '@/types/auth.types';

export const authService = {
  login: (data: ILoginPayload) =>
    api.post<{ token: string; user: IUser }>('/auth/login', data),

  register: (data: IRegisterPayload) =>
    api.post<{ token: string; user: IUser }>('/auth/register', data),

  me: () => api.get<{ user: IUser }>('/auth/me'),

  logout: () => api.delete('/auth/logout'),

  updatePushToken: (pushToken: string) =>
    api.patch('/users/push-token', { pushToken }),
};
