import { useState, useEffect, useRef } from 'react';
import { safeNetInfoFetch, safeNetInfoAddEventListener, SafeNetInfoState } from '@/utils/safeNetInfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

const DEBOUNCE_MS = 3000;

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });
  const [isOffline, setIsOffline] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const evaluate = (state: SafeNetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });

      // Trust isConnected first — it's far less flaky than isInternetReachable.
      // Only treat as offline if isConnected is explicitly false, OR
      // isInternetReachable is explicitly false (not null/undefined) AND
      // that state persists after a short debounce — avoids flashing the
      // banner during brief reachability re-checks while actually online.
      const looksOffline = state.isConnected === false || state.isInternetReachable === false;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (looksOffline) {
        debounceRef.current = setTimeout(() => setIsOffline(true), DEBOUNCE_MS);
      } else {
        setIsOffline(false);
      }
    };

    const unsubscribe = safeNetInfoAddEventListener(evaluate);
    safeNetInfoFetch().then(evaluate);

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { ...status, isOffline };
};
