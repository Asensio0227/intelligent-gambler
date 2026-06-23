import { create } from 'zustand';
import { INotification } from '@/types/notification.types';
import { notificationService } from '@/services/notification.service';

interface NotificationStore {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationService.getAll();
      const data = res.data as any;
      // Backend returns { notifications, page, limit, total }
      set({ notifications: data.notifications ?? data ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationService.getUnreadCount();
      set({ unreadCount: (res.data as any).count ?? 0 });
    } catch {}
  },

  markRead: async (id) => {
    try {
      await notificationService.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.delete(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
    } catch {}
  },
}));
