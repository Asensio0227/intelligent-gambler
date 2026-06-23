import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOffline) setMounted(true);

    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!isOffline) setMounted(false);
    });
  }, [isOffline]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: insets.top + 8, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.icon}>📡</Text>
      <View>
        <Text style={styles.title}>You're offline</Text>
        <Text style={styles.subtitle}>
          Showing cached data · Some features unavailable
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#b45309',
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    elevation: 999,
  },
  icon: { fontSize: 18 },
  title: { color: '#fff', fontWeight: '700', fontSize: 13 },
  subtitle: { color: '#fde68a', fontSize: 11 },
});
