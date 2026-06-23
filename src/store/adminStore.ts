import { create } from 'zustand';
import { IUser } from '@/types/auth.types';
import { IAdminStats, IUsageStats } from '@/types/admin.types';
import { adminService } from '@/services/admin.service';
import { superadminService } from '@/services/superadmin.service';

interface AdminStore {
  stats: IAdminStats | null;
  users: IUser[];
  admins: IUser[];
  usage: IUsageStats | null;
  perUserUsage: Array<{ user: IUser; usage: IUsageStats }>;
  systemConfig: Record<string, string | boolean>;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  fetchUsers: (search?: string, isActive?: boolean, role?: string) => Promise<void>;
  updateUser: (id: string, data: Partial<IUser>) => Promise<void>;
  banUser: (id: string) => Promise<void>;
  unbanUser: (id: string) => Promise<void>;
  suspendUser: (id: string, days: number, reason: string) => Promise<void>;
  syncFixtures: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  createAdmin: (data: { name: string; lastName: string; email: string; password: string }) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
  fetchUsage: () => Promise<void>;
  fetchSystemConfig: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  stats: null,
  users: [],
  admins: [],
  usage: null,
  perUserUsage: [],
  systemConfig: {},
  isLoading: false,

  fetchStats: async () => {
    // /admin/stats does not exist — fetch users and tickets count instead
    set({ isLoading: true });
    try {
      const [usersRes, ticketsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getAllTickets(),
      ]);
      const users = (usersRes.data as any) ?? [];
      const tickets = (ticketsRes.data as any) ?? [];
      set({
        stats: {
          totalUsers: users.length,
          totalTickets: tickets.length,
          totalPredictions: 0,
          fixturesSynced: 0,
        },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUsers: async (search?: string, isActive?: boolean, role?: string) => {
    set({ isLoading: true });
    try {
      const res = await adminService.getUsers({ search, isActive, role });
      set({ users: (res.data as any) ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await adminService.updateUser(id, data);
      const updatedUser = res.data as any;
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? updatedUser : u)),
      }));
    } catch {}
  },

  banUser: async (id: string) => {
    try {
      const res = await adminService.banUser(id);
      const updated = res.data as any;
      set((state) => ({ users: state.users.map((u) => (u._id === id ? updated : u)) }));
    } catch {}
  },

  unbanUser: async (id: string) => {
    try {
      const res = await adminService.unbanUser(id);
      const updated = res.data as any;
      set((state) => ({ users: state.users.map((u) => (u._id === id ? updated : u)) }));
    } catch {}
  },

  suspendUser: async (id: string, days: number, reason: string) => {
    try {
      const res = await adminService.suspendUser(id, days, reason);
      const data = res.data as any;
      const updated = data.user ?? data;
      set((state) => ({ users: state.users.map((u) => (u._id === id ? updated : u)) }));
    } catch {}
  },

  syncFixtures: async () => {
    try {
      await adminService.syncFixtures();
    } catch {}
  },

  fetchAdmins: async () => {
    set({ isLoading: true });
    try {
      const res = await superadminService.getAdmins();
      set({ admins: (res.data as any) ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createAdmin: async (data) => {
    try {
      const res = await superadminService.createAdmin(data);
      const newAdmin = res.data as any;
      set((state) => ({ admins: [newAdmin, ...state.admins] }));
    } catch {}
  },

  removeAdmin: async (id) => {
    try {
      await superadminService.removeAdmin(id);
      set((state) => ({ admins: state.admins.filter((a) => a._id !== id) }));
    } catch {}
  },

  fetchUsage: async () => {
    set({ isLoading: true });
    try {
      const res = await superadminService.getUsage();
      const data = res.data as any;
      // Backend returns array of usage records — sum them up
      if (Array.isArray(data)) {
        const totals = data.reduce((acc: any, item: any) => ({
          predictionsGenerated: (acc.predictionsGenerated ?? 0) + (item.predictionsGenerated ?? 0),
          tokensUsed: (acc.tokensUsed ?? 0) + (item.tokensUsed ?? 0),
          estimatedCost: (acc.estimatedCost ?? 0) + (item.estimatedCost ?? 0),
        }), { predictionsGenerated: 0, tokensUsed: 0, estimatedCost: 0 });
        set({ usage: totals, perUserUsage: data, isLoading: false });
      } else {
        set({ usage: data ?? { predictionsGenerated: 0, tokensUsed: 0, estimatedCost: 0 }, isLoading: false });
      }
    } catch {
      set({ usage: { predictionsGenerated: 0, tokensUsed: 0, estimatedCost: 0 }, isLoading: false });
    }
  },

  fetchSystemConfig: async () => {
    try {
      const res = await superadminService.getSystemConfig();
      set({ systemConfig: (res.data as any) ?? {} });
    } catch {}
  },
}));
