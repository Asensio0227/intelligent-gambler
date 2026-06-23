import { create } from 'zustand';
import { Alert } from 'react-native';
import { ITicket, ITicketProposal, IAutoGenerateParams } from '@/types/ticket.types';
import { ticketService } from '@/services/ticket.service';
import { cacheSet, cacheGet, CACHE, CACHE_TTL } from '@/utils/cache';
import NetInfo from '@react-native-community/netinfo';

interface TicketStore {
  tickets: ITicket[];
  proposals: ITicketProposal[];
  askParams: IAutoGenerateParams | null;
  isLoading: boolean;
  isGenerating: boolean;
  offlineQueue: any[];
  fetchMyTickets: (filters?: {
    status?: string;
    sort?: 'newest' | 'oldest';
    minLegs?: number;
    maxLegs?: number;
    minAvg?: number;
    maxAvg?: number;
  }) => Promise<void>;
  refreshTicketStatuses: () => Promise<void>;
  fetchTicket: (id: string) => Promise<ITicket | null>;
  createTicket: (data: Partial<ITicket>) => Promise<ITicket | null>;
  deleteTicket: (id: string) => Promise<void>;
  autoGenerate: (params: IAutoGenerateParams) => Promise<void>;
  confirmTickets: (proposals: ITicketProposal[]) => Promise<void>;
  askQuery: (query: string) => Promise<void>;
  clearProposals: () => void;
  syncOfflineQueue: () => Promise<void>;
  loadOfflineQueue: () => Promise<void>;
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  proposals: [],
  askParams: null,
  isLoading: false,
  isGenerating: false,
  offlineQueue: [],

  fetchMyTickets: async (filters) => {
    set({ isLoading: true });
    try {
      const res = await ticketService.getMyTickets(filters);
      const data = (res.data as any) ?? [];
      await cacheSet(CACHE.TICKETS, data, CACHE_TTL.TICKETS);
      set({ tickets: data, isLoading: false });
    } catch {
      const cached = await cacheGet<any[]>(CACHE.TICKETS);
      if (cached) {
        set({ tickets: cached.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  fetchTicket: async (id) => {
    try {
      const res = await ticketService.getById(id);
      return res.data as any;
    } catch {
      return null;
    }
  },

  refreshTicketStatuses: async () => {
    try {
      const res = await ticketService.getMyTickets();
      set({ tickets: (res.data as any) ?? [] });
    } catch {}
  },

  createTicket: async (data) => {
    const netState = await NetInfo.fetch();
    const isOffline = !netState.isConnected || netState.isInternetReachable === false;

    if (isOffline) {
      // Queue for later
      const queueItem = { ...data, _queuedAt: Date.now(), _localId: `local_${Date.now()}` };
      set((state) => {
        const newQueue = [...state.offlineQueue, queueItem];
        cacheSet(CACHE.TICKET_QUEUE, newQueue, 7 * 24 * 60 * 60 * 1000);
        return { offlineQueue: newQueue };
      });
      // Return a fake ticket so the UI can show it immediately
      return {
        _id: queueItem._localId,
        label: data.label,
        status: 'PENDING',
        legs: data.legs ?? [],
        summary: {
          totalLegs: data.legs?.length ?? 0,
          averageConfidence: 0,
          legsWon: null,
          legsLost: null,
        },
        createdAt: new Date().toISOString(),
        _isQueued: true,
      } as any;
    }

    try {
      const res = await ticketService.create(data);
      const ticket = res.data as any;
      set((state) => ({ tickets: [ticket, ...state.tickets] }));
      return ticket;
    } catch {
      return null;
    }
  },

  deleteTicket: async (id) => {
    try {
      await ticketService.delete(id);
      set((state) => ({ tickets: state.tickets.filter((t) => t._id !== id) }));
    } catch {}
  },

  autoGenerate: async (params) => {
    set({ isGenerating: true });
    try {
      const res = await ticketService.autoGenerate(params);
      const data = (res.data as any);
      // Handle both array and wrapped response
      const proposals = Array.isArray(data) ? data : (data?.proposals ?? data ?? []);
      if (proposals.length === 0) {
        Alert.alert(
          'No Proposals Found',
          'Not enough predictions exist with your minimum confidence threshold. Try lowering the minimum confidence or generating more predictions first.',
          [{ text: 'OK' }]
        );
      }
      set({ proposals, isGenerating: false });
    } catch (e: any) {
      set({ isGenerating: false });
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to generate tickets. Please try again.');
    }
  },

  confirmTickets: async (proposals) => {
    set({ isLoading: true });
    try {
      const res = await ticketService.confirmTickets(proposals);
      set((state) => ({
        tickets: [...((res.data as any) ?? []), ...state.tickets],
        proposals: [],
        askParams: null,
        isLoading: false,
      }));
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  askQuery: async (query) => {
    set({ isGenerating: true });
    try {
      const res = await ticketService.ask(query);
      const data = res.data as any;
      // Handle both response shapes
      const proposals = data.proposals ?? data ?? [];
      const parsedParams = data.parsedParams ?? data.askParams ?? null;
      set({ proposals, askParams: parsedParams, isGenerating: false });
    } catch (e) {
      set({ isGenerating: false });
      console.error('Ask query failed:', e);
    }
  },

  clearProposals: () => set({ proposals: [], askParams: null }),

  syncOfflineQueue: async () => {
    const { offlineQueue } = useTicketStore.getState();
    if (offlineQueue.length === 0) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;

    const remaining: any[] = [];
    for (const item of offlineQueue) {
      try {
        const { _queuedAt, _localId, ...ticketData } = item;
        const res = await ticketService.create(ticketData);
        const ticket = res.data as any;
        useTicketStore.setState((state) => ({
          tickets: [ticket, ...state.tickets.filter((t: any) => t._id !== _localId)],
        }));
      } catch {
        remaining.push(item);
      }
    }

    await cacheSet(CACHE.TICKET_QUEUE, remaining, 7 * 24 * 60 * 60 * 1000);
    useTicketStore.setState({ offlineQueue: remaining });
  },

  loadOfflineQueue: async () => {
    const cached = await cacheGet<any[]>(CACHE.TICKET_QUEUE);
    if (cached?.data?.length) {
      useTicketStore.setState({ offlineQueue: cached.data });
    }
  },
}));
