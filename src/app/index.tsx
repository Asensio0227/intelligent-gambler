import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/colors';

/**
 * Root entry point — shown briefly while AuthGuard runs restoreSession.
 * Automatically redirects to /(auth)/login or /(tabs) once the session check completes.
 */
export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    // Pulsing dots
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();

    pulse(dotAnim1, 0);
    pulse(dotAnim2, 180);
    pulse(dotAnim3, 360);

    return () => {};
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>⚽</Text>
        </View>

        {/* Brand name */}
        <Text style={styles.brand}>
          Predict<Text style={styles.brandAccent}>Pro</Text>
        </Text>
        <Text style={styles.tagline}>AI-powered football predictions</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  iconText: {
    fontSize: 40,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
