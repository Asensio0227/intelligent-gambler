import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// expo-notifications internally tries to sync the device push token directly
// with Expo's own servers (separate from our own /users/push-token call).
// When that internal fetch gets cancelled (app backgrounding, dev reload, brief
// network drop) it logs this warning. It's caught internally and non-blocking —
// it does not affect our own push token registration with our backend — so we
// silence it here rather than let it clutter logs.
LogBox.ignoreLogs([
  'Error thrown while updating the device push token with the server',
]);

function AuthGuard() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [routerReady, setRouterReady] = useState(false);

  useEffect(() => {
    // Give router time to mount before any navigation
    const readyTimer = setTimeout(() => setRouterReady(true), 200);
    restoreSession();

    // Nuclear fallback — never stuck longer than 5 seconds
    const fallback = setTimeout(() => {
      useAuthStore.setState({ isLoading: false });
    }, 5000);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!routerReady) return;
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (
      isAuthenticated &&
      (inAuth ||
        segments[0] === undefined ||
        segments[0] === 'index' ||
        segments.length === 0)
    ) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, routerReady]);

  return null;
}

export default function RootLayout() {
  const { isOffline } = useNetworkStatus();
  const { syncOfflineQueue, loadOfflineQueue } = useTicketStore();

  useEffect(() => {
    loadOfflineQueue();
  }, []);

  useEffect(() => {
    if (!isOffline) {
      // Back online — sync queued tickets
      syncOfflineQueue();
    }
  }, [isOffline]);

  return (
    <SafeAreaProvider>
      <StatusBar style='light' />
      <OfflineBanner />
      <AuthGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name='index' />
        <Stack.Screen name='(auth)' />
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='(admin)' />
        <Stack.Screen name='(superadmin)' />
        <Stack.Screen name='fixture/[id]' />
        <Stack.Screen name='prediction/[id]' />
        <Stack.Screen name='ticket/[id]' />
        <Stack.Screen name='ticket/new' />
        <Stack.Screen name='ticket/auto' />
        <Stack.Screen name='ticket/ask' />
        <Stack.Screen name='notifications/index' />
        <Stack.Screen name='legal/index' />
        <Stack.Screen name='legal/privacy' />
        <Stack.Screen name='legal/terms' />
        <Stack.Screen name='legal/delete-account' />
        <Stack.Screen name='+not-found' />
      </Stack>
    </SafeAreaProvider>
  );
}
