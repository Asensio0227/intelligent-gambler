import api from './api';
import { INotification } from '@/types/notification.types';

export const notificationService = {
  // Backend returns { notifications, page, limit, total } after unwrap
  getAll: () =>
    api.get<{ notifications: INotification[]; total: number; page: number; limit: number }>('/notifications'),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),

  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
};
