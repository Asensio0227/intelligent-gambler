import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  confidence: number;
  showLabel?: boolean;
}

const getColor = (c: number) => {
  if (c >= 70) return COLORS.success;
  if (c >= 55) return COLORS.warning;
  return COLORS.danger;
};

export const ConfidenceMeter: React.FC<Props> = ({ confidence, showLabel = true }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const color = getColor(confidence);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: confidence / 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [confidence, anim]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color }]}>{confidence}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  label: { fontSize: 12, fontWeight: '700', minWidth: 36, textAlign: 'right' },
});
