import { create } from 'zustand';
import { IFixture, IFixtureFilters } from '@/types/fixture.types';
import { fixtureService } from '@/services/fixture.service';
import { cacheSet, cacheGet, CACHE, CACHE_TTL } from '@/utils/cache';

interface FixtureStore {
  fixtures: IFixture[];
  upcomingFixtures: IFixture[];
  liveFixtures: IFixture[];
  selectedFixtures: string[];
  isLoading: boolean;
  filters: IFixtureFilters;
  cachedAt: number | null;
  isStale: boolean;
  fetchFixtures: (filters?: IFixtureFilters) => Promise<void>;
  fetchUpcoming: () => Promise<void>;
  fetchLive: () => Promise<void>;
  fetchFixture: (id: string) => Promise<IFixture | null>;
  toggleFixtureSelection: (fixtureId: string) => void;
  clearSelection: () => void;
  setFilter: (key: keyof IFixtureFilters, value: string) => void;
}

export const useFixtureStore = create<FixtureStore>((set, get) => ({
  fixtures: [],
  upcomingFixtures: [],
  liveFixtures: [],
  selectedFixtures: [],
  isLoading: false,
  filters: {},
  cachedAt: null,
  isStale: false,

  fetchFixtures: async (filters) => {
    set({ isLoading: true });
    try {
      const res = await fixtureService.getAll(filters ?? get().filters);
      const data = (res.data as any) ?? [];
      await cacheSet(CACHE.FIXTURES, data, CACHE_TTL.FIXTURES);
      set({ fixtures: data, isLoading: false, isStale: false, cachedAt: Date.now() });
    } catch {
      // Network failed — load from cache
      const cached = await cacheGet<any[]>(CACHE.FIXTURES);
      if (cached) {
        set({
          fixtures: cached.data,
          isLoading: false,
          isStale: cached.isStale,
          cachedAt: Date.now(),
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  fetchUpcoming: async () => {
    try {
      const res = await fixtureService.getUpcoming();
      const data = (res.data as any) ?? [];
      await cacheSet(`${CACHE.FIXTURES}_upcoming`, data, CACHE_TTL.FIXTURES);
      set({ upcomingFixtures: data });
    } catch {
      const cached = await cacheGet<any[]>(`${CACHE.FIXTURES}_upcoming`);
      if (cached) set({ upcomingFixtures: cached.data, isStale: true });
    }
  },

  fetchLive: async () => {
    try {
      const res = await fixtureService.getLive();
      set({ liveFixtures: (res.data as any) ?? [] });
    } catch {
      // Live data not cached — too time-sensitive
      set({ liveFixtures: [] });
    }
  },

  fetchFixture: async (id) => {
    try {
      const res = await fixtureService.getById(id);
      return res.data as any;
    } catch {
      return null;
    }
  },

  toggleFixtureSelection: (fixtureId) => {
    const { selectedFixtures } = get();
    if (selectedFixtures.includes(fixtureId)) {
      set({ selectedFixtures: selectedFixtures.filter((id) => id !== fixtureId) });
    } else {
      set({ selectedFixtures: [...selectedFixtures, fixtureId] });
    }
  },

  clearSelection: () => set({ selectedFixtures: [] }),

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },
}));
