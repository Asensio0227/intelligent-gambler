import { useCallback } from 'react';
import { useFixtureStore } from '@/store/fixtureStore';

export const useFixtures = () => {
  const store = useFixtureStore();
  const refresh = useCallback(() => store.fetchFixtures(), [store]);
  return { ...store, refresh };
};
