import { create } from 'zustand';
import { IPrediction } from '@/types/prediction.types';
import { predictionService } from '@/services/prediction.service';
import { fixtureService } from '@/services/fixture.service';
import { cacheSet, cacheGet, CACHE, CACHE_TTL } from '@/utils/cache';

interface FixtureTeams { home: string; away: string; }

interface PredictionStore {
  predictions: Record<string, IPrediction>;
  allPredictions: IPrediction[];
  fixtureTeams: Record<string, FixtureTeams>;
  isLoading: boolean;
  generating: boolean;
  fetchPredictionForFixture: (fixtureId: string) => Promise<IPrediction | null>;
  fetchPrediction: (id: string) => Promise<IPrediction | null>;
  generatePrediction: (fixtureId: string) => Promise<IPrediction | null>;
  fetchAll: () => Promise<void>;
}

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  predictions: {},
  allPredictions: [],
  fixtureTeams: {},
  isLoading: false,
  generating: false,

  fetchPredictionForFixture: async (fixtureId) => {
    set({ isLoading: true });
    try {
      const res = await predictionService.getForFixture(fixtureId);
      const prediction = res.data as any;
      set((state) => ({ predictions: { ...state.predictions, [fixtureId]: prediction }, isLoading: false }));
      return prediction;
    } catch { set({ isLoading: false }); return null; }
  },

  fetchPrediction: async (id) => {
    try { return (await predictionService.getById(id)).data as any; }
    catch { return null; }
  },

  generatePrediction: async (fixtureId) => {
    set({ generating: true });
    try {
      const res = await predictionService.generate(fixtureId);
      const prediction = res.data as any;
      set((state) => ({ predictions: { ...state.predictions, [fixtureId]: prediction }, generating: false }));
      return prediction;
    } catch { set({ generating: false }); return null; }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const res = await predictionService.getAll();
      const predictions: IPrediction[] = (res.data as any) ?? [];
      set({ allPredictions: predictions, isLoading: false });

      // Batch-fetch team names for all unique fixture IDs (skip already cached)
      const normalizeId = (fid: any) =>
        typeof fid === 'object' && fid !== null ? fid._id : fid;

      const uniqueIds = [...new Set(predictions.map((p: any) => normalizeId(p.fixtureId)))];
      const already = get().fixtureTeams;
      const missing = uniqueIds.filter((id) => !already[id]);

      const newTeams: Record<string, FixtureTeams> = {};

      // Predictions whose fixtureId is already a populated object with team
      // data don't need a network call — use them directly.
      predictions.forEach((p: any) => {
        if (
          typeof p.fixtureId === 'object' &&
          p.fixtureId !== null &&
          p.fixtureId?.homeTeam?.name
        ) {
          const fixtureIdValue = p.fixtureId._id;
          newTeams[fixtureIdValue] = {
            home: p.fixtureId.homeTeam.name,
            away: p.fixtureId.awayTeam?.name ?? 'Away',
          };
        }
      });

      const stillMissing = missing.filter((id) => !newTeams[id]);

      if (stillMissing.length) {
        const results = await Promise.allSettled(stillMissing.map((id) => fixtureService.getById(id)));
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            const fx = r.value.data as any;
            if (fx?.homeTeam?.name) {
              newTeams[stillMissing[i]] = { home: fx.homeTeam.name, away: fx.awayTeam?.name ?? 'Away' };
            } else {
              console.warn('Fixture has no homeTeam.name:', stillMissing[i], fx);
            }
          } else {
            console.warn('Failed to fetch fixture for prediction:', stillMissing[i], r.reason);
          }
        });
      }

      const mergedTeams = { ...already, ...newTeams };
      set((state) => ({ fixtureTeams: { ...state.fixtureTeams, ...newTeams } }));
      await cacheSet(CACHE.PREDICTIONS, { predictions, teams: mergedTeams }, CACHE_TTL.PREDICTIONS);
    } catch {
      const cached = await cacheGet<{ predictions: any[]; teams: any }>(CACHE.PREDICTIONS);
      if (cached) {
        set({
          allPredictions: cached.data.predictions,
          fixtureTeams: cached.data.teams,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
