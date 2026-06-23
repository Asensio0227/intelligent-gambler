import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  FIXTURES: 'cache_fixtures',
  PREDICTIONS: 'cache_predictions',
  TICKETS: 'cache_tickets',
  NOTIFICATIONS: 'cache_notifications',
  TICKET_QUEUE: 'cache_ticket_queue',
} as const;

const TTL = {
  FIXTURES: 60 * 60 * 1000,          // 1 hour
  PREDICTIONS: 24 * 60 * 60 * 1000,  // 24 hours
  TICKETS: 30 * 60 * 1000,           // 30 minutes
  NOTIFICATIONS: 30 * 60 * 1000,     // 30 minutes
} as const;

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

export const cacheSet = async <T>(
  key: string,
  data: T,
  ttl: number,
): Promise<void> => {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {}
};

export const cacheGet = async <T>(
  key: string,
): Promise<{ data: T; isStale: boolean } | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    const isStale = Date.now() - entry.cachedAt > entry.ttl;
    return { data: entry.data, isStale };
  } catch {
    return null;
  }
};

export const cacheClear = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

export const CACHE = CACHE_KEYS;
export const CACHE_TTL = TTL;
