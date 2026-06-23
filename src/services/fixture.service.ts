import api from './api';
import { IFixture, IFixtureFilters } from '@/types/fixture.types';

export const fixtureService = {
  // Backend returns array directly after unwrap
  getAll: (filters?: { status?: string; search?: string; sort?: 'asc' | 'desc' }) =>
    api.get<IFixture[]>('/fixtures', { params: filters }),

  getUpcoming: () =>
    api.get<IFixture[]>('/fixtures/upcoming'),

  getLive: () =>
    api.get<IFixture[]>('/fixtures/live'),

  getById: (id: string) =>
    api.get<IFixture>(`/fixtures/${id}`),
};
