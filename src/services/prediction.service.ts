import api from './api';
import { IPrediction, ISimilarMatch } from '@/types/prediction.types';

export const predictionService = {
  getForFixture: (fixtureId: string) =>
    api.get<IPrediction>(`/predictions/fixture/${fixtureId}`),

  getById: (id: string) =>
    api.get<IPrediction>(`/predictions/${id}`),

  generate: (fixtureId: string) =>
    api.post<IPrediction>('/predictions/generate', { fixtureId }),

  getAll: () =>
    api.get<IPrediction[]>('/predictions'),

  getAccuracy: () =>
    api.get<{ total: number; correctResult: number }>('/predictions/accuracy'),

  getSimilar: (predictionId: string, topK = 3) =>
    api.get<ISimilarMatch[]>(`/predictions/${predictionId}/similar`, { params: { topK } }),
};
