import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
}

export const Toast: React.FC<Props> = ({ message, type = 'info', visible }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2800),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity]);

  const bg = type === 'success' ? COLORS.success : type === 'error' ? COLORS.danger : COLORS.primary;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg, opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  text: { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
});
